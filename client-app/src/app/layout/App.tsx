import { Container } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import NavBar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';

function App() {
  const location = useLocation();

  return (
    <> {/*//shortcut for <Fragment></Fragment>*/}
      {location.pathname === '/' ? <HomePage /> : (
        <>
          <NavBar/>
          <Container style={{marginTop:'7em'}}>
            <Outlet />
          </Container>
        </>
      )}            
    </>
  )
}

export default observer(App);
