import { Outlet, Link } from 'react-router-dom'

import { Card, CardBody, CardHeader, Container, Nav } from "reactstrap"
import { BoxHeader } from './BoxHeader'

import { faHome } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Layout = () => {
  return (
    <>
      <BoxHeader />
      <Container>
        <Card className='p-4 m-4 mt--6'>
          <CardHeader>
            <Nav className='mb-4'>
              <Link to={'/'}>
                <FontAwesomeIcon color='black' icon={faHome} />
              </Link>
            </Nav>
          </CardHeader>
          <CardBody>
            <Outlet />
          </CardBody>
        </Card>
      </Container>
    </>
  )
}

export default Layout
