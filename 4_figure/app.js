
const InitDemo = function () {
    loadTextResource('shader.vs.glsl', function(vsErr, vsText) {
        if (vsErr) {
            alert('fatal error with vertex shader')
            console.error(vsErr)
        } else {
            loadTextResource('shader.fs.glsl', function(fsErr, fsText) {
                if (fsErr) {
                    alert('fatal error with fragment shader')
                    console.error(fsErr)
                } else {
                    RunDemo(vsText, fsText)
                }
            })
        }
    })
}

const RunDemo = function (vertexShaderText, fragmentShaderText) {

   //init webgl
   const canvas = document.getElementById('surface');
   let gl = canvas.getContext('webgl');

   if(!gl) {
      console.log('WebGl not supported, falling back on experimental-webgl')
      gl = canvas.getContext('experimental-webgl')
   }

   //set color
   gl.clearColor(0.75, 0.85, 0.8, 1.0); //rgba
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.DEPTH_TEST)
   gl.enable(gl.CULL_FACE);
   gl.frontFace(gl.CCW);
   gl.cullFace(gl.BACK);

   //vertex && fragment shaders
   //create
   const vertexShader = gl.createShader(gl.VERTEX_SHADER);
   const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

   gl.shaderSource(vertexShader, vertexShaderText);
   gl.shaderSource(fragmentShader, fragmentShaderText);

   gl.compileShader(vertexShader)
   if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('ERROR! compiling vertex shader', gl.getShaderInfoLog(vertexShader))
      return;
   }
   gl.compileShader(fragmentShader);
   if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('ERROR! compiling fragment shader', gl.getShaderInfoLog(fragmentShader))
      return;
   }

   //graphics pipeline
   const program = gl.createProgram();
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program)
   if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('ERROR! Linking program', gl.getProgramInfoLog(program))
      return;
   }

   //validation of program
   gl.validateProgram(program)
   if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error('ERROR! Validating program', gl.getProgramInfoLog(program))
      return;
   }

   //create buffer
   var boxVertices =
       [ // X, Y, Z           U, V
          // Top
          -1.0, 1.0, -1.0,   0, 0,
          -1.0, 1.0, 1.0,    0, 1,
          1.0, 1.0, 1.0,     1, 1,
          1.0, 1.0, -1.0,    1, 0,

          // Left
          -1.0, 1.0, 1.0,    0, 0,
          -1.0, -1.0, 1.0,   1, 0,
          -1.0, -1.0, -1.0,  1, 1,
          -1.0, 1.0, -1.0,   0, 1,

          // Right
          1.0, 1.0, 1.0,    1, 1,
          1.0, -1.0, 1.0,   0, 1,
          1.0, -1.0, -1.0,  0, 0,
          1.0, 1.0, -1.0,   1, 0,

          // Front
          1.0, 1.0, 1.0,    1, 1,
          1.0, -1.0, 1.0,    1, 0,
          -1.0, -1.0, 1.0,    0, 0,
          -1.0, 1.0, 1.0,    0, 1,

          // Back
          1.0, 1.0, -1.0,    0, 0,
          1.0, -1.0, -1.0,    0, 1,
          -1.0, -1.0, -1.0,    1, 1,
          -1.0, 1.0, -1.0,    1, 0,

          // Bottom
          -1.0, -1.0, -1.0,   1, 1,
          -1.0, -1.0, 1.0,    1, 0,
          1.0, -1.0, 1.0,     0, 0,
          1.0, -1.0, -1.0,    0, 1,
       ];

   const boxIndices =
       [
          // Top
          0, 1, 2,
          0, 2, 3,

          // Left
          5, 4, 6,
          6, 4, 7,

          // Right
          8, 9, 10,
          8, 10, 11,

          // Front
          13, 12, 14,
          15, 14, 12,

          // Back
          16, 17, 18,
          16, 18, 19,

          // Bottom
          21, 20, 22,
          22, 20, 23
       ];

   let boxVertexBufferObject = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

   let boxIndexBufferObject = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

   //inform that we have vertex
   const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
   const texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord')
   gl.vertexAttribPointer(
       positionAttribLocation, //attribute location
       3,  //number of elements per attr
       gl.FLOAT, //type of el
       gl.FALSE,
       5 * Float32Array.BYTES_PER_ELEMENT, //size of an indiv vertex
       0  // offset from the beginning of a single vertex to this attribute
   );
   gl.vertexAttribPointer(
       texCoordAttribLocation, //attribute location
       2,  //number of elements per attr
       gl.FLOAT, //type of el
       gl.FALSE,
       5 * Float32Array.BYTES_PER_ELEMENT, //size of an indiv vertex
       3 * Float32Array.BYTES_PER_ELEMENT  // offset from the beginning of a single vertex to this attribute
   );

   gl.enableVertexAttribArray(positionAttribLocation)
   gl.enableVertexAttribArray(texCoordAttribLocation)

   //texture
   const boxTexture = gl.createTexture()
   gl.bindTexture(gl.TEXTURE_2D, boxTexture);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texImage2D(
       gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
       gl.UNSIGNED_BYTE,
       document.getElementById('crate-image')
   );
   gl.bindTexture(gl.TEXTURE_2D, null);

   gl.useProgram(program)

   const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
   const matViewUniformLocation = gl.getUniformLocation(program, 'mView');
   const matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

   const worldMatrix = new Float32Array(16)
   const viewMatrix = new Float32Array(16)
   const projMatrix = new Float32Array(16)
   mat4.identity(worldMatrix);
   mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0])
   mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

   gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
   gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
   gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

   let xRotationMatrix = new Float32Array(16)
   let yRotationMatrix = new Float32Array(16)

   //rendering loop
   let identityMatrix = new Float32Array(16);
   mat4.identity(identityMatrix);
   let angle = 0;
   const loop = function () {
      angle = performance.now() / 1000 / 6 * 2 * Math.PI;
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0,1,0]);
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1,0,0]);
      mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix)
      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

      gl.clearColor(0.75, 0.85, 0.8, 1.0);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

      gl.bindTexture(gl.TEXTURE_2D, boxTexture);
      gl.activeTexture(gl.TEXTURE0);

      gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(loop);
   }
   requestAnimationFrame(loop);

}

InitDemo();
