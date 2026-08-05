#!/bin/bash

# 如果安装了 proxychains 则走代理，否则直连
if command -v proxychains >/dev/null 2>&1; then
  PROXY="proxychains -q"
elif command -v proxychains4 >/dev/null 2>&1; then
  PROXY="proxychains4 -q"
else
  PROXY=""
fi

$PROXY pnpx wxt submit "$1" \
--chrome-zip output/*-chrome.zip \
--edge-zip output/*-edge.zip \
--firefox-zip output/*-firefox.zip \
--firefox-sources-zip output/*-sources.zip
