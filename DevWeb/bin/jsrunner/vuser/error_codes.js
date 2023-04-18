'use strict';

// Error Codes Range -103848 - -103820
// Do not define codes outside this range. This range is defined in devweb_ext in devweb_ext_msg.eng

const ErrorCodes = {
  sdk: -103848,
  sdk_logic: -103847,
  custom: -103846,
  crash: -103845,
  script: -103844,
  parsing: -103843,
  socket: -103842,
  extractors: -103841
};

module.exports = ErrorCodes;
