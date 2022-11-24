# Hackersir Sheep Wall

逢甲大學資安週所架設之釣魚 Wi-Fi

⚠ 此專案目的為[逢甲大學黑客社](https://hackersir.org)用於推廣資安意識之用途, 請勿用於任何非法目的

## About The Project

此專案使用了以下幾個工具來實作綿羊牆:

- hostapd
  - 架設 Access Point
- dnsmasq
  - DHCP server
- iptables
  - 路由兩個介面卡之封包
- mitmproxy
  - 中間人透明代理

## Getting Started

### Hardware limitation

需要至少一個支援 AP 模式的 Wi-Fi 介面卡來開啟 Access Point, 及一個對外用的網路介面卡

不是所有的 Wi-Fi 介面卡都支援 AP 模式, 請先確認介面卡支援 AP Mode

```bash
iw list

# output should contains "AP" here
Supported interface modes:
         * AP
```

### Ubuntu

由於 Ubuntu 內的 systemd-resolved 會搶佔 53 port, 因此需要先關閉 systemd-resolved

[Source](https://unix.stackexchange.com/a/676977)

1. 修改`/etc/systemd/resolved.conf`, 設定 DNS 並將`DNSStubListener`改為`no`

   ```bash
   [Resolve]
   DNS=1.1.1.1#cloudflare-dns.com 1.0.0.1#cloudflare-dns.com 2606:4700:4700::1111#cloudflare-dns.com 2606:4700:4700::1001#cloudflare-dns.com
   DNSStubListener=no
   ```

2. 將`/etc/resolv.conf`軟連結到`/run/systemd/resolve/resolv.conf`

   ```bash
   sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
   ```

3. 重啟`systemd-resolved`

   ```bash
   sudo systemctl restart systemd-resolved
   ```

4. 檢查一下 53 port 還有沒有被佔用

   ```bash
   sudo lsof -i :53
   ```

### mitmproxy

由於 mitmproxy 9.x.x 內建的 `allow_host` 及 `ignore_host` 僅能同時設定 http 與 https 之過濾條件, 因此將於啟動時自動載入 [main.py](src\mitmproxy\scripts\main.py) 來複寫內部邏輯

預設設定會載入以下腳本:

- [scripts/inject.py](src\mitmproxy\scripts\inject.py)

  - 在攔截的 HTML Response Body 末端注入自訂的 HTML, 來提示使用者網路連線不安全
  - 注入的 HTML 位於 [inject](src\mitmproxy\scripts\inject)

- [scripts/customUI](src\mitmproxy\scripts\customUI.py)

  - 自製的展示用網頁 UI, 掛載於 web server 的 `/hackersir/` 路徑下
  - 網頁原始碼位於 [web](web)

### Start

根據環境來修改 `.env`, 並運行 docker

```bash
sudo docker compose up
```

啟動完成後將於以下的 port 開啟對應服務:

- 53
  - mitmproxy DNS 代理
- 8080
  - mitmproxy 透明代理
- 8081
  - mitmproxy web UI

## Advanced

此專案使用 Cloudflare DNS 作為來源 DNS, 你可以在 [config.yaml](src\mitmproxy\config.yaml) 中修改

詳細 Access Point 設定可以在 [ap](src\ap) 中找到

## FAQ

Question: 裝置連上 Wi-Fi 後無法上網

Answer: 確認裝置的 Gateway 及 DNS 是否為 Server IP

Question: 看不到裝置所發出的請求

Answer: 裝置上可能有安裝 VPN 或設定 Private DNS. 將它關閉並確認 DHCP 設定正確

## Acknowledgments

https://android.googlesource.com/platform/external/wpa_supplicant_8/+/refs/heads/master/hostapd/hostapd.conf

https://e-mailky.github.io/2018-07-14-dnsmasq
