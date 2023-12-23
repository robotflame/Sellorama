using System.ComponentModel.DataAnnotations;
using System.Linq.Dynamic.Core;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace sello.Models {
    public class Query {
        public Query() {}

        public int PageIndex { get; set; } = 1;
        
        [Range(0, 40)]
        public int PageSize { get; set; } = 20;
        
        public string? Where { get; set; }
        
        public string? OrderBy { get; set; }

        public async Task<IQueryable<T>> Apply<T>(IQueryable<T> queryable) where T : class {
            // TODO figure out how to not load everything into ram, and instead dynamicaly add to the query
            var result = (await queryable.ToListAsync()).AsQueryable();
            
            if (this.OrderBy != null)
                result = queryable.OrderBy(this.OrderBy);
            
            if (this.Where != null)
                result = result.Where(this.Where);

            result = result.Page(this.PageIndex, this.PageSize);

            return result;
        }
    }
}