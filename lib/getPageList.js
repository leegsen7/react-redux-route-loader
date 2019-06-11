const path = require('path');
const glob = require('glob').sync;

module.exports = function ({
  mainJsx,
  pageFolder,
}) {
  const cwdPath = path.resolve(process.cwd(), pageFolder);
  return glob(`**/${mainJsx}`, {
    cwd: cwdPath,
  }).reduce((pre, cur) => {
    const pagePath = cur.replace(new RegExp(`/${mainJsx}$`), '');
    return pre.concat([{
      path: pagePath,
      absolutePath: `@${pageFolder}/${pagePath}`,
      cwdPath: `${cwdPath}/${pagePath}`,
    }]);
  }, []);
};
