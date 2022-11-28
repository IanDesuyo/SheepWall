FROM debian:stable

RUN apt-get update && apt-get install -y net-tools dnsmasq hostapd iptables

RUN mkdir /app
WORKDIR /app

ADD ./dnsmasq.conf /etc/dnsmasq.conf
ADD ./hostapd.conf /etc/hostapd/hostapd.conf
ADD ./hostapd /etc/default/hostapd

ADD ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]