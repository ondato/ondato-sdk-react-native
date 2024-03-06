package com.ondatosdkreactnative

import com.google.gson.JsonObject

class OSRNState() {
  var status: OSRNStatus? = null
  var message: String? = null
  var load: JsonObject? = null

  constructor (status: OSRNStatus, message: String) : this() {
    this.status = status
    this.message = message
  }

  constructor (status: OSRNStatus, message: String, load: JsonObject) : this() {
    this.status = status
    this.message = message
    this.load = load
  }
}
