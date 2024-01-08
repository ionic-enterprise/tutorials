---
title: Sharing
sidebar_label: Sharing
sidebar_position: 2
---

In the previous tutorial on downloading we ended up with a `path` variable that has the location of the file that we downloaded.

We may want to share it, which allows another application to use it (for example emailing it). For this we'll use the [`@capacitor/share`](https://capacitorjs.com/docs/apis/share) plugin.

```typescript
import { Share } from '@capacitor/share';
...
    await Share.share(
      {
        title: 'Share PDF',
        text: 'Share the PDF',
        files: [path]
      }
    );
```

Here, we have taken the `path` variable that was set when we downloaded the file and called the `share` method which will show the native dialog to share a file.

You can try out the **share** feature in [this sample repository](https://github.com/ionic-enterprise/tutorials-pdf-share-open/blob/7c49c4f228ba3ff5fa9123f81e184d81889a86dd/src/app/home/home.page.ts#L50).