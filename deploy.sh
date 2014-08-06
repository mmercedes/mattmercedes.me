#!/bin/sh

git push
rhc ssh -a home "mkdir -p app-root/repo/verification"
scp verification/* 53db00f4e0b8cdf88d00006f@home-mmercedes.rhcloud.com:/var/lib/openshift/53db00f4e0b8cdf88d00006f/app-root/repo/verification/
rhc app restart -a home
