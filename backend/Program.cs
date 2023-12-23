using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using sello.Data;
using sello.Hubs;
using sello.Implementation;
using sello.Interface;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

var connection_string = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING");
// Configure the HTTP request pipeline.
if (connection_string is null)
{
    System.Console.WriteLine("using sqlite!");
    builder.Services.AddDbContext<DatabaseContext>(options =>
        options.UseSqlite("DataSource=app.db;Cache=Shared"));
    builder.Services.AddTransient<IImageStorage, LocalStorageRepository>();
}
else {
    System.Console.WriteLine("using azureDB!");
    builder.Services.AddDbContext<DatabaseContext>(options =>
        options.UseSqlServer(connection_string));
}

builder.Services.AddTransient<IMessages, MessagesRepository>();
builder.Services.AddTransient<IUsers, UsersRepository>();
builder.Services.AddTransient<IReviews, ReviewsRepository>();
builder.Services.AddTransient<IListings, ListingsRepository>();

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddAuthentication(o => {
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
    options.IncludeErrorDetails = true;
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters() {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});
//builder.Services.AddAuthorization();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "Sello API", 
        Version = "v1" 
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Description = @"Please provide authorization token to access restricted features.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { 
            new OpenApiSecurityScheme 
            { 
                Name = "Bearer",
                In = ParameterLocation.Header,
                Reference = new OpenApiReference
                { 
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer" 
                } 
            },
            new string[] { } 
        } 
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
        .WithOrigins("http://localhost:5173") // Allow CORS for frontend
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

var app = builder.Build();

var imgs = ((IApplicationBuilder)app).ApplicationServices.GetService<IImageStorage>();

// Call the database initializer
using (var services = app.Services.CreateScope())
{
    var db = services.ServiceProvider.GetRequiredService<DatabaseContext>();
    DatabaseInitializer.Initialize(db, imgs);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("CorsPolicy");
}
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseRouting();
app.UseAuthorization();

app.MapControllers();
app.MapSwagger().RequireAuthorization();
app.MapHub<ChatHub>("/api/chathub");

app.Run();
