---
title: Protect the Routes
sidebar_label: Protect the Routes
sidebar_position: 3
---

## Overview

Now that we are authenticating with a provider we need to look at protecting our routes. This protection takes two major forms:

1. Guarding our routes so a user cannot navigate to various places within our application unless they are logged in.
1. Protecting our backend API such that users cannot access data without a valid access token. Our role is to pass the access token to our API.

We will also see how to handle the possibility that our APIs may now issue 401 errors in cases where our access token has expired or is otherwise invalid.

We will build upon the application we created in the [getting started tutorial](getting-started) in order to implement route guards for our application's routes as well as to add HTTP interceptors to attach access tokens to outgoing requests and to handle potential 401 errors in responses.

## Let's Code

As mentioned previously, this tutorial builds upon the application created when doing the [getting started tutorial](getting-started). If you have the code from when you performed that tutorial, then you are good to go. If you need the code you can make a copy from [our GitHub repository](https://github.com/ionic-enterprise/tutorials-and-demos-ng/tree/main/auth-connect/getting-started).

### Route Guards

We are using the `Tab1Page` to manage our authentication status. Let's assume that the `Tab2Page` and `Tab3Page` should only be accessible if the user is authenticated. We already have a method that determines if the user is authenticated or not. In its most basic form, we use the existence of an `AuthResult` with an access token to determine whether or not we are authenticated. Other tutorials show how this can be expanded.

<CH.Code rows={10}>

```typescript authentication.service.ts focus=49:52
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(platform: Platform, private session: SessionService) {
    const isNative = platform.is('hybrid');
    this.provider = new Auth0Provider();
    this.authOptions = {
      audience: 'https://io.ionic.demo.ac',
      clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
      discoveryUrl:
        'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
      logoutUrl: isNative
        ? 'msauth://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      redirectUri: isNative
        ? 'msauth://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      scope: 'openid offline_access email picture profile',
    };

    this.isReady = AuthConnect.setup({
      platform: isNative ? 'capacitor' : 'web',
      logLevel: 'DEBUG',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: 'implicit',
      },
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const authResult = await this.getAuthResult();
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  }

  async login(): Promise<void> {
    await this.isReady;
    const authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.saveAuthResult(authResult);
  }

  async logout(): Promise<void> {
    await this.isReady;
    const authResult = await this.getAuthResult();
    if (authResult) {
      await AuthConnect.logout(this.provider, authResult);
      this.saveAuthResult(null);
    }
  }

  private async getAuthResult(): Promise<AuthResult | null> {
    return this.session.getSession();
  }

  private async saveAuthResult(authResult: AuthResult | null): Promise<void> {
    if (authResult) {
      await this.session.setSession(authResult);
    } else {
      await this.session.clear();
    }
  }
}
```

</CH.Code>

We will use an Angular [CanActivate guard](https://angular.io/api/router/CanActivateFn) to protect those routes. Generate the guard via `npx ng generate guard core/guards/auth`:

<CH.Code>

```bash Terminal focus=1,3,7:8
npx ng generate guard core/guards/auth
? Which type of guard would you like to create? (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
❯◉ CanActivate
 ◯ CanActivateChild
 ◯ CanDeactivate
 ◯ CanMatch
CREATE src/app/core/guards/auth.guard.spec.ts (482 bytes)
CREATE src/app/core/guards/auth.guard.ts (133 bytes)
```

</CH.Code>

Now that the guard has been generated, we need to build it out.

<CH.Scrollycoding>

<CH.Code>

```typescript tabs.routes.ts
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
```

```typescript auth.guard.ts
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};
```

</CH.Code>

For this application, we want to guard the `tab2` and `tab3` routes. We cannot guard `tab1` because we are using that one to log in.

---

<CH.Code>

```typescript tabs.routes.ts focus=3,19,25
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
        canActivate: [authGuard],
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
        canActivate: [authGuard],
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
```

</CH.Code>

Import the `authGuard` and apply it to those two routes.

---

<CH.Code>

```typescript auth.guard.ts
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};
```

</CH.Code>

We can still navigate to the `tab2` and `tab3` routes because our guard always returns `true`.

---

<CH.Code>

```typescript auth.guard.ts focus=1,3,5[46:50],6
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthenticationService);

  return true;
};
```

</CH.Code>

We need to make our guard `async` and inject the `AuthenticationService`.

---

<CH.Code>

```typescript auth.guard.ts focus=8:12
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthenticationService);

  if (await authService.isAuthenticated()) {
    return true;
  }

  return false;
};
```

</CH.Code>

We can then check the user's authentication status. We want to return `true` if the user is authenticated. Otherwise we want to return `false`.

</CH.Scrollycoding>

Test this in your app. You should see that you cannot navigate to `Tab2Page` or `Tab3Page` unless you are authenticated. This is exactly what we want and it works well.

Run the application in a web browser and navigate directly to `http://localhost:8100/tabs/tab2` while not authenticated. The result will be a white screen. We cannot navigate to the path, but we also don't have an existing route upon which to remain. We need to navigate somewhere. Let's add some code to navigate to the `Tab1Page` in cases such as this.

<CH.Code>

```typescript auth.guard.ts focus=3,8,14
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from '../authentication.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authentication = inject(AuthenticationService);
  const navigation = inject(NavController);

  if (await authentication.isAuthenticated()) {
    return true;
  }

  navigation.navigateRoot('/tabs/tab1');
  return false;
};
```

</CH.Code>

Now when navigating directly to `http://localhost:8100/tabs/tab2` while not authenticated, the user will be redirected to `Tab1Page` to authenticate. Note that this _seems_ like something that only applies when running in the web and not a problem for our native application. This could be an issue for our native app, however, if it is using deep links or if our default route is protected.

### Provide the Access Token

When a user logs in using [Auth Connect](https://ionic.io/docs/auth-connect) the application receives an `AuthResult` that represents the authentication session. The `AuthResult` object provides access to several types of tokens:

- **ID Token**: The ID token contains information pertaining to the identity of the authenticated user. The information within this token is typically consumed by the client application.
- **Access Token**: The access token signifies that the user has properly authenticated. This token is typically sent to the application's backend APIs as a bearer token. The token is verified by the API to grant access to the protected resources exposed by the API. Since this token is used in communications with the backend API, a common security practice is to give it a very limited lifetime.
- **Refresh Token**: Since access tokens typically have a short lifetime, longer lived refresh tokens are used to extend the length of a user's authentication session by allowing the access tokens to be refreshed.

The most common way for the backend API to protect its routes is to require that requests include a valid access token. As such, we are going to have to send the access token with each request.

<CH.Scrollycoding>

<CH.Code>

```typescript authentication.service.ts focus=69:73
import { Injectable } from '@angular/core';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authOptions: ProviderOptions;
  private provider: Auth0Provider;
  private isReady: Promise<void>;

  constructor(platform: Platform, private session: SessionService) {
    const isNative = platform.is('hybrid');
    this.provider = new Auth0Provider();
    this.authOptions = {
      audience: 'https://io.ionic.demo.ac',
      clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
      discoveryUrl:
        'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
      logoutUrl: isNative
        ? 'msauth://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      redirectUri: isNative
        ? 'msauth://auth-action-complete'
        : 'http://localhost:8100/auth-action-complete',
      scope: 'openid offline_access email picture profile',
    };

    this.isReady = AuthConnect.setup({
      platform: isNative ? 'capacitor' : 'web',
      logLevel: 'DEBUG',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: 'implicit',
      },
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const authResult = await this.getAuthResult();
    return (
      !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult))
    );
  }

  async login(): Promise<void> {
    await this.isReady;
    const authResult = await AuthConnect.login(this.provider, this.authOptions);
    this.saveAuthResult(authResult);
  }

  async logout(): Promise<void> {
    await this.isReady;
    const authResult = await this.getAuthResult();
    if (authResult) {
      await AuthConnect.logout(this.provider, authResult);
      this.saveAuthResult(null);
    }
  }

  async getAccessToken(): Promise<string | undefined> {
    await this.isReady;
    const res = await this.getAuthResult();
    return res?.accessToken;
  }

  private async getAuthResult(): Promise<AuthResult | null> {
    return this.session.getSession();
  }

  private async saveAuthResult(authResult: AuthResult | null): Promise<void> {
    if (authResult) {
      await this.session.setSession(authResult);
    } else {
      await this.session.clear();
    }
  }
}
```

```typescript tab1.page.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthenticationService } from './../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ExploreContainerComponent],
})
export class Tab1Page implements OnInit {
  authenticated = false;

  constructor(private authentication: AuthenticationService) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  async login(): Promise<void> {
    await this.authentication.login();
    this.checkAuthentication();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
    this.checkAuthentication();
  }

  private async checkAuthentication(): Promise<void> {
    this.authenticated = await this.authentication.isAuthenticated();
  }
}
```

```html tab1.page.html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab 1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab 1</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-button
    *ngIf="!authenticated"
    (click)="login()"
    data-testid="login-button"
    >Login</ion-button
  >
  <ion-button
    *ngIf="authenticated"
    (click)="logout()"
    data-testid="logout-button"
    >Logout</ion-button
  >
  <pre>{{ accessToken }}</pre>
</ion-content>
```

</CH.Code>

Add a method to the `AuthenticationService` that gets the access token:

---

<CH.Code>

```typescript tab1.page.ts focus=16,36
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthenticationService } from './../core/authentication.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ExploreContainerComponent],
})
export class Tab1Page implements OnInit {
  authenticated = false;
  accessToken: string | undefined = '';

  constructor(private authentication: AuthenticationService) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  async login(): Promise<void> {
    await this.authentication.login();
    this.checkAuthentication();
  }

  async logout(): Promise<void> {
    await this.authentication.logout();
    this.checkAuthentication();
  }

  private async checkAuthentication(): Promise<void> {
    this.authenticated = await this.authentication.isAuthenticated();
    this.accessToken = await this.authentication.getAccessToken();
  }
}
```

</CH.Code>

Modify the `Tab1Page` to grab the access token.

---

<CH.Code>

```html tab1.page.html focus=26
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title> Tab 1 </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tab 1</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-button
    *ngIf="!authenticated"
    (click)="login()"
    data-testid="login-button"
    >Login</ion-button
  >
  <ion-button
    *ngIf="authenticated"
    (click)="logout()"
    data-testid="logout-button"
    >Logout</ion-button
  >
  <pre>{{ accessToken }}</pre>
</ion-content>
```

</CH.Code>

Display the results in the page.

</CH.Scrollycoding>

We would not normally grab the access token and display it like that. This is just being done to make sure everything is working. Log in and out a few times. You should see a token while logged in but not while logged out.

We will use an HTTP interceptor to attach the access token to outgoing HTTP requests. Use `npx ng generate interceptor core/interceptors/auth` to generate the code.

<CH.Code>

```bash Terminal
npx ng generate interceptor core/interceptors/auth
CREATE src/app/core/interceptors/auth.interceptor.spec.ts (404 bytes)
CREATE src/app/core/interceptors/auth.interceptor.ts (409 bytes)
```

</CH.Code>

We now need to build up the interceptor and hook it up so it executes with each request.

<CH.Scrollycoding>

<CH.Code>

```typescript auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request);
  }
}
```

```typescript main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes),
  ],
});
```

</CH.Code>

The Angular CLI generated the start of the interceptor for us.

---

<CH.Code>

```typescript auth.interceptor.ts focus=9,13
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authentication: AuthenticationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request);
  }
}
```

</CH.Code>

Inject the authentication service.

---

<CH.Code>

```typescript auth.interceptor.ts focus=22:24
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authentication: AuthenticationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request);
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/public$/.test(req.url);
  }
}
```

</CH.Code>

Not all requests require a token. For our made up use-case, paths ending in `public` do not need a token.

---

<CH.Code>

```typescript auth.interceptor.ts focus=8[22:35],19:25
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from, mergeMap } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authentication: AuthenticationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return from(
      this.requestRequiresToken(request)
        ? this.authentication.getAccessToken().then((token) => {
            null;
          })
        : Promise.resolve()
    ).pipe(mergeMap(() => next.handle(request)));
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/public$/.test(req.url);
  }
}
```

</CH.Code>

Before passing the request to the next handler in the pipeline, get the access token if it is required for this request.

---

<CH.Code>

```typescript auth.interceptor.ts focus=22:28
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from, mergeMap } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authentication: AuthenticationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return from(
      this.requestRequiresToken(request)
        ? this.authentication.getAccessToken().then((token) => {
            if (token) {
              request = request.clone({
                setHeaders: {
                  Authorization: 'Bearer ' + token,
                },
              });
            }
          })
        : Promise.resolve()
    ).pipe(mergeMap(() => next.handle(request)));
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/public$/.test(req.url);
  }
}
```

</CH.Code>

If the token exists add it to the request as a bearer token.

---

<CH.Code>

```typescript main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes),
  ],
});
```

</CH.Code>

The `main.ts` file needs to be updated to provide the interceptor.

---

<CH.Code>

```typescript main.ts focus=9,10,19
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes),
  ],
});
```

</CH.Code>

Include the `AuthInterceptor` in the [HTTP_INTERCEPTORS](https://angular.io/api/common/http/HTTP_INTERCEPTORS).

</CH.Scrollycoding>

### Handle 401 Errors

Now that the access token is sent to the backend, we need to also handle the case where the backend rejects the access token resulting in a [401 - Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) response status. This can be done through another HTTP interceptor.

<CH.Code>

```bash Terminal
npx ng generate interceptor core/interceptors/unauth
CREATE src/app/core/interceptors/unauth.interceptor.spec.ts (416 bytes)
CREATE src/app/core/interceptors/unauth.interceptor.ts (411 bytes)
```

</CH.Code>

The interceptor needs to be built out to clear the session data and navigate to the login page when a 401 error occurs.

<CH.Scrollycoding>

<CH.Code>

```typescript unauth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request);
  }
}
```

```typescript main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes),
  ],
});
```

</CH.Code>

We are starting with the generated interceptor.

---

<CH.Code>

```typescript unauth.interceptor.ts focus=8[22:24],18:23
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        error: async (err: unknown) => {},
      })
    );
  }
}
```

</CH.Code>

Tap into the observable pipeline for the request. Notice that we only need to handle the `error` case.

---

<CH.Code>

```typescript unauth.interceptor.ts focus=9,10,14:17
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NavController } from '@ionic/angular';
import { SessionService } from '../session.service';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  constructor(
    private navigation: NavController,
    private session: SessionService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        error: async (err: unknown) => {},
      })
    );
  }
}
```

</CH.Code>

Inject the `NavController` and `SessionService`.

---

<CH.Code>

```typescript unauth.interceptor.ts focus=25:30
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NavController } from '@ionic/angular';
import { SessionService } from '../session.service';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  constructor(
    private navigation: NavController,
    private session: SessionService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        error: async (err: unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            await this.session.clear();
            this.navigation.navigateRoot(['/', 'tabs', 'tab1']);
          }
        },
      })
    );
  }
}
```

</CH.Code>

If the error is an `HttpErrorResponse` and the status is `401`, clear the session and redirect so the user can log in again.

</CH.Scrollycoding>

## Next Steps

Currently, if we have an `AuthResult` with an access token we assume the user is properly authenticated. If you would like to expand this logic to first make sure the access token has not expired, and try to refresh it if it has, then please have a look at the tutorial on [refreshing the session](refresh-workflow).

Happy coding!! 🤓
