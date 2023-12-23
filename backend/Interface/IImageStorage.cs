namespace sello.Interface {
    public interface IImageStorage {
        public void DeleteAll();
        public Task<FileInfo?> AddImageStreamAsync(Stream imageByteStream, string name);
        public void RemoveImage(string name);
        public FileStream GetImageStream(string name);
    }
}