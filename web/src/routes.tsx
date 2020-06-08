import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'

import Home from './pages/Home'
import CreateFacility from './pages/CreateFacility'

const Routes = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={CreateFacility} path="/cadastro" />
    </BrowserRouter>
  )
}

export default Routes