using System.Security.Cryptography;
using sello.Models.User;

namespace sello.Data {
    public static class Hasher
    {
        public static (string, byte[]) PasswordHash(string rawPassword) {
            var salt = RandomNumberGenerator.GetBytes(16);
            var pbkdf2 = new Rfc2898DeriveBytes(rawPassword, salt, 16_384, HashAlgorithmName.SHA256);
            var key = Convert.ToBase64String(pbkdf2.GetBytes(16));
            return (key, salt);
        }

        public static  bool PasswordVerify(User user, string rawPassword) {
            var salt = user.Salt;
            var pbkdf2 = new Rfc2898DeriveBytes(rawPassword, salt, 16_384, HashAlgorithmName.SHA256);
            var key = Convert.ToBase64String(pbkdf2.GetBytes(16));
            return string.Equals(key, user.Password);
        }
    }
}