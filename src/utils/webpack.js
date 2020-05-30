function findLoaderByLoaderName(loaders, loaderName) {
  const regExp = new RegExp(`node_modules[\\/\\\\]${loaderName}`, 'i')
  return loaders.find((loader) => regExp.test(loader.path))
}

module.exports = {
  findLoaderByLoaderName
}
