export class Upload {
    $key: string;
    file: File;
    image_name: string;
    image_url: string;
    image_caption: string;
    progress: number;
    uploaded_on: any;
    display: any;
    count: number;
    name: string;
    url: String;
    
    constructor(file: File) {
        this.file = file;
        
    }
}