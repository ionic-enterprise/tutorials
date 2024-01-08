---
title: Opening
sidebar_label: Opening
sidebar_position: 3
---

In the previous tutorial on downloading we ended up with a `path` variable that has the location of the file that we downloaded.

You may want to open and view the PDF file we downloaded. To do this we need to use a plugin and for this example we'll use `@capacitor-community/file-opener`.

First, lets install it:
```bash
npm install @capacitor-community/file-opener
npx cap sync
```

Then in our code we'll call the `open` method using the `path` variable that has the location of our downloaded PDF.

```typescript
import { FileOpener } from '@capacitor-community/file-opener';
...

    await FileOpener.open({
      filePath: path,
      openWithDefault: true
    });
```

On iOS this will open a PDF viewer. On Android this will open a file opener dialog showing applications it can open that will view the PDF (for example Google Drive).

You can try out the **open** feature in [this sample repository](https://github.com/ionic-enterprise/tutorials-pdf-share-open/blob/7c49c4f228ba3ff5fa9123f81e184d81889a86dd/src/app/home/home.page.ts#L96).
