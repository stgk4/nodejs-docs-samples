/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require(`proxyquire`).noPreserveCache();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const vision = proxyquire(`@google-cloud/vision`, {})();

test.before(tools.stubConsole);
test.after.always(tools.restoreConsole);

test.cb(`should detect labels`, (t) => {
  const expectedFileName = `./resources/wakeupcat.jpg`;
  const visionMock = {
    labelDetection: (_request) => {
      let _fileName = _request.source.filename;
      t.is(_fileName, expectedFileName);

      return vision.labelDetection(_request)
        .then((results) => {
          const labels = results[0].labelAnnotations;
          t.true(Array.isArray(labels));
          setTimeout(() => {
            try {
              t.is(console.log.callCount, 6);
              t.deepEqual(console.log.getCall(0).args, [`Labels:`]);
              labels.forEach((label, i) => {
                t.deepEqual(console.log.getCall(i + 1).args,
                    [label.description]);
              });

              t.end();
            } catch (err) {
              t.end(err);
            }
          }, 200);
          return results;
        });
    }
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/vision': sinon.stub().returns(visionMock)
  });
});
