const path = require('path');
const fs = require('fs');

const checkExists = url => fs.existsSync(url);
const getUniqueId = prefix => {
  let uniqueId = 0;
  return () => `${prefix}_${uniqueId++}`;
};
const getUniqueReducer = getUniqueId('_$reducer');
const getUniqueSaga = getUniqueId('_$saga');

// __ROOT_ROUTE__
module.exports.route = function (pageList, options) {
  const importList = [
    `import Loadable from 'react-loadable';\n`,
    `import { combineReducers } from 'redux';\n`,
  ];
  const replaceList = pageList.filter(item => {
    return !options.externals.some(child => item.path.indexOf(child) === 0);
  }).map(item => {
    const component = `Loadable({
        loader: () => import(/* webpackChunkName: '${item.path}' */'${item.absolutePath}/${options.mainJsx}').then(res => {
          const { saga, reducer } = res;
          // 插入异步加载的reducer
          if (!rootReducers['${item.path}']) {
            rootReducers['${item.path}'] = reducer;
            store.replaceReducer(combineReducers(rootReducers));
          }
          // 插入异步加载的saga
          store.dispatch({
            type: '${options.UPDATE_SAGA}',
            saga,
          });
          return res;
        }),
        loading: () => ${options.loadingName},
      })`;
    return `<Route exact path='/${item.path}' component={${component}} />\n`;
  });
  return [importList.join(''), replaceList.join('')];
};
// __ROOT_REDUCERS__
module.exports.reducer = function (pageList, options) {
  const {
    dataManage,
    externals,
  }  = options;
  const importList = [];
  const replaceList = ['{'];
  pageList.filter(item => {
    return externals.some(child => item.path.indexOf(child) === 0);
  }).forEach(item => {
    if (checkExists(`${item.cwdPath}/${dataManage}`)) {
      const curReducerName = getUniqueReducer();
      importList.push(`import ${curReducerName} from '${item.absolutePath}/${dataManage}';\n`);
      replaceList.push(`['${item.path}']: ${curReducerName},\n`);
    }
  });
  replaceList.push('}');
  return [importList.join(''), replaceList.join('')];
};
// __ROOT_SAGA__
module.exports.saga = function (pageList, options) {
  const importList = [];
  const replaceList = ['['];
  pageList.filter(item => {
    return options.externals.some(child => item.path.indexOf(child) === 0);
  }).forEach(item => {
    if (checkExists(`${item.cwdPath}/saga.js`)) {
      const curSagaName = getUniqueSaga();
      importList.push(`import ${curSagaName} from '${item.absolutePath}/saga.js'\n`);
      replaceList.push(`${curSagaName}(),\n`);
    }
  });
  replaceList.push(']');
  return [importList.join(''), replaceList.join('')];
};
