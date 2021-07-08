window.EVENT_NUM = 0;

window.getEventNum = () => {
    EVENT_NUM++;
    return 'EVENT_' + EVENT_NUM;
};

window.EventConst = {};
EventConst.RESIZE = getEventNum();          // 页面resize
EventConst.TICK = getEventNum();            // 刷新时间
EventConst.FILE_END = getEventNum();        // 单个文件加载结束（不对外）
EventConst.LOAD_END = getEventNum();        // 所有文件加载结束（不对外）
EventConst.RES_PROGRESS = getEventNum();    // 资源加载进度变更（对外）
EventConst.RES_READY = getEventNum();       // 所有资源加载结束（对外）
