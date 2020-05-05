const renameObjKey = (obj, oldName, newName) => {
  if(!obj.hasOwnProperty(oldName)) {
    return false;
  }

  obj[newName] = obj[oldName];
  delete obj[oldName];
  return true;
}

module.exports = renameObjKey
