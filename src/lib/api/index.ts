export interface ICollectData<T> {
    buryId?: string;
    serviceName: string;
    eventName: string;
    eventTimestamp: string;
    operatorUid: string;
    operatedObjId?: string;
    operatedObjInfo?: T;
}

export const collect = async <T>(serviceHost: string, collectParam: ICollectData<T>) => {
    const {
        buryId,
        serviceName,
        eventName,
        eventTimestamp,
        operatorUid,
        operatedObjInfo
    } = collectParam;
    const operatedObjInfoString = encodeURI(JSON.stringify(operatedObjInfo));
    const url = `${serviceHost}/api/v1/bury/collect`.replace(/\/\//g, '/');
    const query = `/${serviceName}/${eventName}/${eventTimestamp}?buryId=${buryId}&operatorUid=${operatorUid}&operatedObjInfo=${operatedObjInfoString}`;
    const fullURL = url + query;

    const image = new Image();
    image.src = fullURL;
}
