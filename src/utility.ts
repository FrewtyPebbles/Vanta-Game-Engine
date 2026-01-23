export default class Utility {
    static async load_text_file(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.text();
    }

    static async load_image(image_asset_path:string, options?: ImageBitmapOptions):Promise<ImageBitmap> {
        const res = await fetch(image_asset_path);
        if (res.ok) {
            const blob = await res.blob();
            return await createImageBitmap(blob, options);
        } else {
            throw new Error(`The .obj image asset file at "${image_asset_path}" does not exist.`);
        }
    }
}