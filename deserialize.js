function deserialize(string) {
  return eval("(" + string + ")");
};

function unserialize(string) {
  return deserialize(string);
};
