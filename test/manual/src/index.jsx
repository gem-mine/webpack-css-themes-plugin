import React from 'react'
import { render } from 'react-dom'
// eslint-disable-next-line import/no-unresolved
import { Button } from 'fish'
import Demo from './demo'

function App() {
  return (
    <div className="App">
      <Demo />
      <Button type="primary">Button</Button>
    </div>
  )
}

render(<App />, document.querySelector('#root'))
