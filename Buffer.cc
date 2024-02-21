#include "Buffer.h"
#include <stdlib.h>
#include <string.h>

Buffer::Buffer(size_t size) {
  size_ = size;
  if (size != 0)
    Resize(size);
}
void Buffer::Read(char* buf, size_t len, size_t off) {
  size_t zeros = 0;
  if (size_ - off > len) {
    zeros = (size_ - off) - len;
    len -= zeros;
  }
  memcpy(buf, buf_ + off, len);
  if (zeros)
    memset(buf + len, '\0', zeros);
}
bool Buffer::Write(char* buf, size_t len, size_t off) {
  if (off + len > size_ && !Resize(off + len))
    return false;
  memcpy(buf_ + off, buf, len);
  return true;
}
bool Buffer::Resize(size_t len) {
  char* newBuf = (char*)realloc(buf_, len);
  if (!newBuf)
    return false;
  buf_ = newBuf;
  size_ = len;
  return true;
}