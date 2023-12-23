using sello.Interface;

namespace sello.Implementation {
    public class LocalStorageRepository : IImageStorage {
        private readonly DirectoryInfo _folder;
        
        public LocalStorageRepository() {
            var dir = @"./images";
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            _folder = new DirectoryInfo(dir);
        }

        public void DeleteAll() {
            foreach (var file in _folder.GetFiles()) {
                file.Delete();
            }
        }

        public async Task<FileInfo?> AddImageStreamAsync(Stream imageByteStream, string name) {
            var file = new FileInfo(Path.Combine(_folder.FullName, name));
            await using var fileStream = file.Create();
            imageByteStream.Seek(0, SeekOrigin.Begin);
            await imageByteStream.CopyToAsync(fileStream);

            return file;
        }

        public void RemoveImage(string name) {
            var file = new FileInfo(Path.Combine(_folder.FullName, name));
            file.Delete();
        }

        public FileStream GetImageStream(string name) {
            var file = new FileInfo(Path.Combine(_folder.FullName, name));
            return file.OpenRead();
        }
    }
}