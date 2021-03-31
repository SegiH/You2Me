#!/usr/bin/env python 
from __future__ import print_function
# This file is part of pyacoustid.
# Copyright 2011, Adrian Sampson.
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

"""Example script that identifies metadata for files specified on the
command line.
"""
import acoustid
import os
import sys

# API key for this demo script only. Get your own API key at the
# Acoustid Web for your application.
# http://acoustid.org/
API_KEY = 'cSpUJKpD'

row = 0
# Python 2/3 Unicode compatibility: this `print_` function forces a
# unicode string into a byte string for printing on Python 2, avoiding
# errors in the process, and does nothing on Python 3, where
# stdout/stderr are text streams (and there's not much we can do about
# that).
# if sys.version_info[0] < 3:
#    def print_(s):
#        print(s.encode(sys.stdout.encoding, 'replace'))
# else:
#    def print_(s):
#        print(s)

# print(sys.version_info.minor)
# sys.exit(1)

if (sys.version_info.major == 2):
     reload(sys)
     sys.setdefaultencoding('utf8');
elif (sys.version_info.major == 3 and sys.version_info.minor < 4):
     import imp
     imp.reload(sys)
elif (sys.version_info.major == 3 and sys.version_info.minor >= 4):
     import importlib;
     importlib.reload(sys)


def aidmatch(filename):
    try:
        results = acoustid.match(API_KEY, filename)
    except acoustid.NoBackendError:
        print("chromaprint library/tool not found", file=sys.stderr)
        sys.exit(1)
    except acoustid.FingerprintGenerationError:
        print("fingerprint could not be calculated", file=sys.stderr)
        sys.exit(1)
    except acoustid.WebServiceError as exc:
        print("web service request failed:", exc.message, file=sys.stderr)
        sys.exit(1)

    row = 1
   
    # print(list(results))
    
    for score, rid, title, artist in results:
        if row > 1:
            break
        
        row=row+1

        # print('"%s"' % (title))
        if (artist is None):
             artist=""

        if (title is None):
             title=""

        print('"%s","%s"' % (artist,title))
        # sys.exit(1)
    
if __name__ == '__main__':
    aidmatch(sys.argv[1])
