---
title: Downloading
sidebar_label: Downloading
sidebar_position: 1
---

Managing PDF and other files is a common task in an application and depending on the task you may need various plugins to accomplish your needs. This tutorial is applicable for PDFs, Images or any file types.

This tutorial covers:
- [Downloading](#best-way-to-download)
- [Sharing](#share-the-pdf)
- [Opening](#open-the-pdf)

You can try out these features in [this sample repository](https://github.com/ionic-enterprise/tutorials-pdf-share-open).

## Downloading Options
There are various ways you **could** download a file in a Capacitor app:
1. Use the [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) API
2. Use a library like [Axios](https://axios-http.com/) or Angular's [HTTPClient](https://angular.io/api/common/http/HttpClient)
3. Use Capacitor's [Native HTTP methods](https://capacitorjs.com/docs/apis/http)
4. Use Capacitor's [`DownloadFile`](https://capacitorjs.com/docs/apis/filesystem#downloadfile) method

However, there are some caveats to some of these approaches:
- Using `fetch`, `Axios` or `HttpClient` require the right CORS setup to allow downloading the PDF.
- `Capacitor HTTP` is limited by the amount of memory on the device to download and write a Base 64 encoded PDF. It also does not have a way to indicate progress of download.

## Best Way to Download

The best approach is to use the `DownloadFile` method.

Below we download the file from a `url`, setting `path` to the filename we want the file to be stored as on the device.

```typescript
import { Directory, Filesystem } from '@capacitor/filesystem';

...

const { path } = await Filesystem.downloadFile({
        directory: Directory.Cache, 
        path: 'mypdf.pdf', 
        url 
     }); 
```

When it has downloaded the file it will return the `path`. This can be used to share the PDF or open it.

## Download Progress

To display a progress indicator in the UI we can use the `ion-progress-bar` Ionic component:
```html
 @if (downloading) {
    <ion-progress-bar [value]="progress"></ion-progress-bar>
}
```

In this example we display the progress bar only if we are `downloading`. We need to set the `value` property to a value between 0 and 1 which is done using the [`progress`](https://capacitorjs.com/docs/apis/filesystem#addlistenerprogress-) event:
```typescript
import { NgZone } from '@angular/core';
...
constructor(ngZone: NgZone) {
    Filesystem.addListener('progress', (progressStatus) => {
      ngZone.run(() => {        
        this.progress = progressStatus.bytes / progressStatus.contentLength;
      });
    });
}
```

You will notice that:
- We use `ngZone` to tell Angular that the we are making changes to something in the view (the `progress` variable). This is needed because any events that are emitted from Capacitor are not captured by Angular.
- We calculate the progress by dividing `bytes` by `contentLength` from the [`ProgressStatus`](https://capacitorjs.com/docs/apis/filesystem#progressstatus) object that is given when the `progress` event occurs.

Next, we'll need to modify our `downloadFile` method to make sure it is emitting its progress by setting `progress` to `true`:
```typescript
this.downloading = true;

const { path } = await Filesystem.downloadFile({ 
    directory: Directory.Cache, 
    progress: true,
    path: 'mypdf.pdf', 
    url
    });

this.downloading = false;
```

You can try out the **downloadFile** features in [this sample repository](https://github.com/ionic-enterprise/tutorials-pdf-share-open/blob/7c49c4f228ba3ff5fa9123f81e184d81889a86dd/src/app/home/home.page.ts#L44).