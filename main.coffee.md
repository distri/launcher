Launcher
========

Launch a package from a json url.

    {extend} = require "util"
    QueryString = require "./lib/qs"

    global.ENV ?= {}

    extend ENV, QueryString.parse(document.location.search.substr(1))

    # if PACKAGE.name is "ROOT"
    #   ENV.PACKAGE_URL = "https://s3.amazonaws.com/whimsyspace-databucket-1g3p6d9lcl6x1/data/1fd5d1704c461b3ae6845fa7c0dd4a4181fc4b3f?duder"

    $.getJSON(ENV.PACKAGE_URL)
    .then (pkg) ->
      new Promise (resolve, reject) ->
        # Load deps
        loadedCount = 0
        onload = ->
          loadedCount += 1
          if loadedCount is scriptCount
            resolve(pkg)

        scriptCount = 0
        loadDep = (src) ->
          scriptCount += 1
          script = document.createElement("script")
          script.onload = onload
          document.head.appendChild script
          script.src = src

        (pkg.remoteDependencies || []).forEach loadDep

    .then (promise) -> # Bad dog jQuery, BAD DOG!
      promise.then require
