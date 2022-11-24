#!/bin/bash

# Environment variables
AP_IFACE="${AP_IFACE:-wlan0}"
NET_IFACE="${NET_IFACE:-eth0}"
SSID="${SSID:-Hackersir Danger Zone}"
AP_CHANNEL="${AP_CHANNEL:-1}"
AP_NET="${AP_NET:-10.0.0.0/20}"
HOST_ADDR="${HOST_ADDR:-10.0.0.1}"
DHCP_RANGE="${DHCP_RANGE:-10.0.1.1,10.0.15.254,2h}"

# Update configuration
ifconfig $AP_IFACE $AP_NET

sed -i "s/interface=.*/interface=$AP_IFACE/g" /etc/dnsmasq.conf
sed -i "s/listen-address=.*/listen-address=$HOST_ADDR/g" /etc/dnsmasq.conf
sed -i "s/dhcp-range=.*/dhcp-range=$DHCP_RANGE/g" /etc/dnsmasq.conf
sed -i "s/dhcp-option=.*/dhcp-option=option:dns-server,$HOST_ADDR/g" /etc/dnsmasq.conf

sed -i "s/interface=.*/interface=$AP_IFACE/g" /etc/hostapd/hostapd.conf
sed -i "s/ssid=.*/ssid=$SSID/g" /etc/hostapd/hostapd.conf
sed -i "s/channel=.*/channel=$AP_CHANNEL/g" /etc/hostapd/hostapd.conf

# Enable IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# Reset iptables
echo "Reset iptables"
iptables -t nat -F
iptables -F
iptables -X

# Enable NAT
echo "Setup iptables"
iptables -t nat -A POSTROUTING -o "$NET_IFACE" -j MASQUERADE
iptables -A FORWARD -i "$NET_IFACE" -o "$AP_IFACE" -m state --state RELATED,ESTABLISHED -j ACCEPT 
iptables -A FORWARD -i "$AP_IFACE" -o "$NET_IFACE" -j ACCEPT

# Forward all http/https traffic to mitmproxy which is running on port 8080
iptables -t nat -A PREROUTING -i "$AP_IFACE" -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables -t nat -A PREROUTING -i "$AP_IFACE" -p tcp --dport 443 -j REDIRECT --to-port 8080

# Start services
echo "Start services"
/etc/init.d/hostapd start
/etc/init.d/dnsmasq start

# handle SIGTERM
trap "service hostapd stop; service dnsmasq stop; exit 0" SIGTERM

echo "Done"
# Keep container running
sleep infinity & wait
