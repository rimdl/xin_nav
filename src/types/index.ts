export interface siteType{
    id:number,
    name:string,
    url:string,
    icon:string,
    category:string
}

export interface categoryType{
    id:number,
    name:string,
    icon:string,
}

export interface searchEngineType{
    id:number,
    name:string,
    icon:string,
    url:string
}

export interface systemConfigType{
    openInNewTab: boolean,
    defaultEngine: string
}

