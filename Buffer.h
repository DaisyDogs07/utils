#include <unistd.h>

class Buffer {
 public:
  Buffer(size_t size = 0);

  void Read(char* buf, size_t len, size_t off);
  bool Write(char* buf, size_t len, size_t off);
  bool Resize(size_t len);

 private:
  size_t size_;
  char* buf_ = NULL;
};