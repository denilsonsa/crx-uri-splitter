![logo](./icons/icon-logo-32.png) URI Splitter (browser extension)
===============================

[Donation - buy me a coffee](https://denilson.sa.nom.br/donate.html)

Browser extension to easily and quickly edit the URL/URI from the current page.

* [Get it on Chrome Web Store!][cws]
* [Get it on Mozilla Firefox Add-ons!][amo] - both on desktop and on Android

Features:

* Free and open-source.
* No (extra) permissions required.
* Keyboard shortcuts.
* Intuitive and easy-to-use.
* Customizable fonts.
* [Internationalized domain name][idn] support (thanks to [punycode.js][punycode] library).
* Light and dark color schemes.
* Browser sync (your options are synced across devices).

[![Screenshot of an Amazon search page in the extension](images/Example-amazon.png)][cws]

[![Screenshot of httpbin with parameters and HTTP authentication](images/Example-auth.png)][cws]

[![Screenshot of IDN support](images/Example-IDN-microsoft.png)][cws]

[![Screenshot of Wikimapia URL in the extension](images/Example-wikimapia.png)][cws]

[![Screenshot of options screen](images/Options.png)][cws]

How to use
----------

To activate the extension, just click on ![its icon](./icons/icon-logo-16.png) or press `Ctrl+Shift+L` (or `Control+L` on Mac). This shortcut has been chosen because it is similar to [the browser's shortcut to focus the location bar][chrome-shortcuts] (`Ctrl+L` or `⌘L`).

![Screenshot of example.com in the extension](images/Example-example.png)

When the extension is activated, it will automatically focus and select the full URL inside the extension window. This means that, right away, the extension can give a feel similar to the browser location bar.

The extension window has two main regions: the full URL and the individual fields. Any changes done to the full URL will automatically reflect into the individual fields; and any changes on each field will automatically update the full URL.

After you have finished editing (or just viewing) the URL, you probably want to open it in the current tab, in a new tab, in a new background tab, in a new window, or in a new incognito window. All of these actions can also be done by keyboard, with shortcuts that mimic the basic browser behavior. The only exception is opening in the same window, which can be activated either by `Enter` or by `Alt+Enter`. This was done because `Enter` inserts a newline in multi-line fields.

If you forget the keyboard shortcuts, just press `Ctrl` or `Alt` or `⌘` and all the available shortcuts will be shown. Also, all single-letter shortcuts can be activated either by `Ctrl` (or `⌘`) or by `Alt`. This was implemented so that you can focus on using the extension, instead of trying to remember what keyboard modifier you have to use.

![Screenshot of the keyboard shortcuts](images/Shortcuts-Mac.png)

It is possible to tweak the behavior of the multi-line fields by going into the *quick options* (`⚙` button, or `Ctrl+O` or `⌘O`). The default settings should work for most cases, but the options are there in case they don't work for you. You can even set multiple characters as separators (in that case, the first character will be used for joining the lines when building the full URL).

![Screenshot of quick options](images/Quick-options.png)

Differences between each version
--------------------------------

Browser sync is achieved using the browser's own syncing feature. That means the options will be synced across multiple Chrome browsers signed in with the same Google account, and across multiple Firefox browsers signed in with the same Mozilla account. It is not possible to sync across different browser vendors.

This extension is also available for [Firefox for Android](https://play.google.com/store/apps/details?id=org.mozilla.firefox). However, due to [technical reasons](https://discourse.mozilla.org/t/top-apis-mising-on-firefox-for-android/124506), some features are not available:

| Feature                                                | Desktop | Mobile |
|:-------------------------------------------------------|:-------:|:------:|
| Keyboard shortcut to launch the extension              |   Yes   |   No   |
| Keyboard shortcuts inside the extension                |   Yes   |   Yes  |
| Native tooltips on mouse-over                          |   Yes   |   No   |
| Opening the extension settings directly from the popup |   Yes   |   No   |
| Opening in a new tab at the end of all tabs            |   Yes   |   Yes  |
| Opening in a new tab next to the current one           |   Yes   |   No   |
| Opening in a background tab                            |   Yes   |   No   |
| Opening in a new window                                |   Yes   |   No   |
| Opening in a new incognito/private window              |   Yes   |   No   |
| Browser sync (for syncing the options across devices)  |   Yes   |   No   |

History
-------

Sometime around 2012 or 2013, while working for Google, I felt the need for a quick, easy and error-proof way to edit parameters in URLs. Me, my team and other teams were spending too much time trying to find the exact parameter in the location bar (AKA address bar) in order to change its value. It was very annoying and time-consuming, specially when debugging, and even worse if accidentally the same parameter ended up twice in the URL.

Out of this need, I wrote the first version of *URI Splitter* and released it inside the company. Immediately, all my coworkers started using it.

In 2013, I left the company, and that version of the Chrome extension stayed there. I always wanted to release it to the public, but never got around doing it.

Fast-forward to 2017, I'm still editing URLs and I still can't find a good tool. Yet again, I see my coworkers going through similar trouble. That's when [MarkVozzo][] contacted me because he liked that extension so much that he wanted to use it outside Google. (And he's not even a developer! Heck, I also want to use it again!) This request prompted me to rebuild the extension from scratch, and [this repository right here][gh] is the result.

The code in this repository is a complete recreation of the Chrome extension I had built while working for Google. The code here was written from scratch, and now has more features than the older extension (which was — and still is — only available for Google employees).

FAQ
---

### URI? URL? What's the difference?

[URI][] is a more generic term than [URL][]. In practice, for the purposes of this project, they mean the same.

### How do I use username and password?

The *username* and *password* fields in this extension are part of the [URI syntax][syntax]. They can be used for [basic HTTP authentication][auth]. Most people will never use this, but sometimes developers need it for specific requests. If you are not sure you need it, then you don't need it, and you can ignore those fields.

It is worth noting that [Chrome 59][sr1] dropped support for [credentials in subrequests][sr2]. So, if you use *username*/*password* in the URL, pay attention to the [browser's developer console][console], because all subrequests (such as CSS, JavaScript or images) might be blocked.

### What's the relationship between this extension and Google

None.

### Isn't there an extension with the same name released inside Google?

Yes. I wrote that one too. Read more about it in [*History*](#history).

### Do you know there is a newer version of punycode.js?

Yes, I know. But [newer versions dropped support for running it inside Browser](https://github.com/bestiejs/punycode.js/commit/cd35cc29f01db597ff0122d314b572b2180687ec).

### How do I customize the fonts?

You use the same syntax as [CSS `font` property](https://developer.mozilla.org/docs/Web/CSS/font).

### I've messed up with the font definition. How do I reset it to the default?

Just delete whatever you wrote in there, and that option will be reset to the default. Then just close and reopen the options screen to see the default font in there.

### Why is the default shortcut for launching this extension different on Mac?

Because Chrome refuses to use `Command+Shift+L` as the shortcut. (Why? I don't know!) Thus, I've changed it to `Control+L` (AKA `MacCtrl+L`) instead.

### Why so many shortcuts for each input field?

So that you don't have to think. For instance, the part after `?` is sometimes called [*query* string](https://en.wikipedia.org/wiki/Query_string), other times [*search* string](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/search), but both names mean the same concept. So both `Q` and `S` were chosen as shortcuts. Since it is also prefixed by `?`, that character also works as a shortcut. If you prefer thinking spatially, each field also has a numeric shortcut. Thus, whatever shortcut comes first to your mind, you can use.

Credits
-------

[Mathias Bynens][mb] for writing [punycode.js][punycode].

[MarkVozzo][] for contacting me, giving me one more reason to release this extension to the world.

My wife for re-creating the logo of this extension. And for all support she gives me!


[cws]: https://chrome.google.com/webstore/detail/fdfikmgcjjhkdpejagohhojbopclfckn
[amo]: https://addons.mozilla.org/en-US/firefox/addon/uri-splitter/
[MarkVozzo]: https://twitter.com/MarkVozzo
[gh]: https://github.com/denilsonsa/crx-uri-splitter/
[idn]: https://en.wikipedia.org/wiki/Internationalized_domain_name
[punycode]: https://github.com/bestiejs/punycode.js/tree/v1.4.1
[mb]: https://mathiasbynens.be/
[chrome-shortcuts]: https://support.google.com/chrome/answer/157179
[URI]: https://en.wikipedia.org/wiki/Uniform_Resource_Identifier
[URL]: https://en.wikipedia.org/wiki/URL
[syntax]: https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Syntax
[auth]: https://en.wikipedia.org/wiki/Basic_access_authentication
[sr1]: https://www.chromestatus.com/feature/5669008342777856
[sr2]: https://groups.google.com/a/chromium.org/d/msg/blink-dev/lx-U_JR2BF0/Hsg1fiZiBAAJ
[console]: https://developers.google.com/web/tools/chrome-devtools/console/

TODO
----

* [ ] Better handling when the extension lacks Incognito access
    * When the user hasn't yet given incognito permission to the extension, clicking on the "Incognito" button throws an error:
        * Error: Cannot open URL "…" in an incognito window.
        * Error: Extension does not have permission for incognito mode
    * <https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#allow_access>
    * <https://support.google.com/chrome_webstore/answer/2664769#:%7E:text=Manage%20your%20extensions>
    * <https://developer.chrome.com/docs/extensions/reference/api/extension#method-isAllowedIncognitoAccess>
    * Likewise, a similar error happens on Chrome when trying local `file:` URIs:
        * Error: Cannot navigate to a file URL without local file access.
    * I should find a way to communicate this to the user. Possibly using a help page, possibly being displayed in the popup window.
* Publication-related
    * [ ] Publish to Edge
    * [ ] Publish to Opera
    * [ ] Test/publish somewhere else? Maybe Safari?
* [ ] Create new screenshots, both Firefox and Chrome, light and dark, desktop and mobile
* [ ] Add a context menu item to open link in the extension pop-up
* [ ] Redesign the icon to be more readable
