#!/bin/sh

git push
rhc ssh -a home "mkdir -p app-root/repo/verification; mkdir -p app-root/repo/img"
scp verification/* 53db00f4e0b8cdf88d00006f@home-mmercedes.rhcloud.com:/var/lib/openshift/53db00f4e0b8cdf88d00006f/app-root/repo/verification/
scp img/* 53db00f4e0b8cdf88d00006f@home-mmercedes.rhcloud.com:/var/lib/openshift/53db00f4e0b8cdf88d00006f/app-root/repo/img/
rhc app restart -a home
