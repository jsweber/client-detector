export const CollectApi = 'https://openxlab.org.cn/gw/data-bury/api/v1/bury/collect';

export interface ICollectData<T> {
    buryId: string;
    serviceName: string;
    eventName: string;
    eventTimestamp: string;
    operatorUid: string;
    operatedObjId?: string;
    operatedObjInfo?: T;
}

export const collect = async <T>(collectApi: string, collectParam: ICollectData<T>) => {
    const resp = await fetch(collectApi, {
        method: 'POST',
        body: JSON.stringify(collectParam)
    });
    return resp.json();
}
