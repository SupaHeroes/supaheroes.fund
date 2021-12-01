import type { NextPage } from "next";
import { Menu, Row, Col, Empty, Button } from "antd";
import Link from "next/link";

const Header: NextPage = () => {
    const centerStyle = {
        display: 'flex',
        justifyContent: 'center',
        border:"none"
      };
  return (
    <div>
      <header>
        <Row style={{padding:15}}>
          <Col span={6}  style={{display:"flex",justifyContent:"left", alignItems:"center"}}>
            <Link href="/">
             <h1 style={{paddingLeft:20}}>Supaheroes</h1>
            </Link>
          </Col>
          <Col span={12}>
            <Menu  mode="horizontal" style={centerStyle}>
              <Menu.Item key="mail">Home</Menu.Item>
              <Menu.Item key="docs">Docs</Menu.Item>
              <Menu.Item key="gov">Governance</Menu.Item>
            </Menu>
          </Col>

          <Col span={6} style={{display:"flex",justifyContent:"right", alignItems:"center"}}><Button style={{background:"green"}}>Launch App</Button></Col>
        </Row>
      </header>
    </div>
  );
};

export default Header;
