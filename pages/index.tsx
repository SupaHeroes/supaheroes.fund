import type { NextPage } from "next";
import { Menu, Row, Col, Empty } from "antd";
import Head from "next/head";
import Header from "./header";
import Image from "next/image";
import Link from 'next/link'


const Home: NextPage = () => {
  const style = {
    border: "1px",
    borderStyle:"solid",
  }
  return (
    <div>
      <Head>
        <title>Supaheroes | Crowdfunding Protocol</title>
        <meta property="og:title" content="My page title" key="title" />
      </Head>
      <Header/>      
      
      <Row style={{marginTop:"36px"}}>
      <Col span={4}/>
        <Col span={8} style={style}><p>Crowdfunding on The Blockchain</p><p>Earn high APY</p></Col>
        <Col span={8}><Empty/></Col>
        <Col span={4}/>
      </Row>
      
    </div>
  );
};

export default Home;
