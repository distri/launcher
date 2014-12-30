QueryString = require "../lib/qs"

describe "QueryString", ->
  it "should parse", ->
    JSON.stringify QueryString.parse(document.location.search.substr(1))
