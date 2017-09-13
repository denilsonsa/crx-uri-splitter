URI Splitter (Chrome extension)
===============================

[![Donate using PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=denilsonsa%40gmail%2ecom&lc=US&item_name=Denilson&item_number=crx-uri-splitter&currency_code=BRL) [![Flattr this project](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=denilsonsa&url=https%3A%2F%2Fgithub.com%2Fdenilsonsa%2Fcrx-uri-splitter&title=crx-uri-splitter&description=Chrome+extension+to+easily+and+quickly+edit+the+URL+URI+from+the+current+page.&tags=github&category=software)

Chrome extension to easily and quickly edit the URL/URI from the current page. [Get it on Chrome Web Store!][cws]

Features:

* Free and open-source.
* No (extra) permissions required.
* Keyboard shortcuts.
* Intuitive and easy-to-use.
* Customizable fonts.

History
-------

Sometime around 2012 or 2013, while working for Google, I felt the need for a quick, easy and error-proof way to edit parameters in URLs. Me, my team and other teams were spending too much time trying to find the exact parameter in the location bar (AKA address bar) in order to change its value. It was very annoying and time-consuming, specially when debugging, and even worse if accidentally the same parameter ended up twice in the URL.

Out of this need, I wrote the first version of *URI Splitter* and released it inside the company. Immediately, all my coworkers started using it.

In 2013, I left the company, and that version of the Chrome extension stayed there. I always wanted to release it to the public, but never got around doing it.

Fast-forward to 2017, I'm still editing URLs and I still can't find a good tool. Yet again, I see my coworkers going through similar trouble. That's when [MarkVozzo][] contacted me because he liked that extension so much that he wanted to use it outside Google. (And he's not even a developer! Heck, I also want to use it again!) This request prompted me to rebuild the extension from scratch, and [this repository right here][gh] is the result.

The code in this repository is a complete recreation of the Chrome extension I had built while working for Google. The code here was written from scratch, and now has more features than the older extension (which was — and still is — only available for Google employees).



TODO:
* Proper README.
    * What is this, how does it work, sample use-cases
* Screenshots and promotional images.
* Look also at the footer of options.js
    * Needs better styling and better writing.

[cws]: https://chrome.google.com/webstore/detail/fdfikmgcjjhkdpejagohhojbopclfckn
[MarkVozzo]: https://twitter.com/MarkVozzo
[gh]: https://github.com/denilsonsa/crx-uri-splitter/
