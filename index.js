const loaderUtils = require('loader-utils');
const getPageList = require('./lib/getPageList');
const getReplaceContent = require('./lib/getReplaceContent');

// 默认配置
const defaultOptions = {
  baseDir: 'src',
  externals: ['home'],
  mainJsx: 'view.jsx',
  pageFolder: 'src/pages',
  dataManage: 'reducer.js',
  loadingName: 'Loading',
  UPDATE_SAGA: '@@INNER/UPDATE_SAGA',
};
const rootConfig = {
  reducer: '__ROOT_REDUCERS__',
  saga: '__ROOT_SAGA__',
  route: '__ROOT_ROUTE__',
};
const getRelativePath = ({ resourcePath }) => resourcePath.replace(process.cwd(), '');

module.exports = function(code) {
  const options = Object.assign({}, defaultOptions, loaderUtils.getOptions(this));
  const {
    mainJsx,
    pageFolder,
    dataManage,
  } = options;
  const isMainJsx = new RegExp(`^/${pageFolder}/.+${mainJsx}$`).test(getRelativePath(this));
  if (isMainJsx) {
    const appendCode = `
      export { default as saga} from './saga';\n
      export { default as reducer} from './${dataManage}'\n;
    `;
    return appendCode + code;
  }
  Object.keys(rootConfig).forEach(item => {
    if (code.includes(rootConfig[item])) {
      const pageList = getPageList(options);
      const [importStr, replaceStr] = getReplaceContent[item](pageList, options);
      code = importStr + code;
      code = code.replace(rootConfig[item], replaceStr);
    } else {
      this.cacheable();
    }
  });
  return code;
};
