#!/bin/bash

sudo firewall-cmd --add-port=6379/tcp --zone=public --permanent
sudo systemctl restart firewalld