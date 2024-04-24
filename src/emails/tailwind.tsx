import { ReceiptEmailProps } from "@/types";
import {
  Body,
  Html,
  Tailwind,
  Container,
  Section,
  Row,
  Text,
  Column,
  Link,
  Hr,
  Heading,
  Img,
} from "@react-email/components";

export const TailwindEmail = ({
  listingUrl,
  recieptID,
  userName,
  listingLocation,
  listingDate,
  listingTime,
  listingPhone,
  listingEmail,
  listingBy,
  listingPrice,
  paymentMethod,
  laebEmail,
  laebPhone,
  laebInstagram,
  laebFacebook,
  laebTwitter,
  partnerPage,
}: ReceiptEmailProps) => (
  <Html>
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              brand: "#007291",
            },
            fontFamily: {
              mainFont: [
                '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
              ],
            },
          },
        },
      }}
    >
      <head>
        <style></style>
      </head>
      <Body>
        <Container className="font-mainFont md:m-[10px_auto] sm:w-[600px] max-w-[100%] border border-black m-[5px_auto] w-[300px]">
          <Section className="md:p-[22px_40px] p-[5px_10px] bg-gray-200">
            <Row>
              <Column className="w-100px md:w-fit">
                <Text style={global.paragraphWithBold}>Receipt Number</Text>
                <Text style={track.number}>{recieptID ?? "0380294711"}</Text>
              </Column>
              <Column align="right">
                <Link
                  style={{ ...global.button, cursor: "pointer" }}
                  className="md:text-16px text-12px md:p-[10px_0px] p-[5px_0px] w-full hover:bg-[#000000]"
                  href={listingUrl}
                >
                  View Listing
                </Link>
              </Column>
            </Row>
          </Section>
          <Hr style={global.hr} />
          <Section style={message}>
            <Img
              src={
                "https://firebasestorage.googleapis.com/v0/b/laeb-uwl.appspot.com/o/logo.jpg?alt=media&token=6003a317-47ee-4606-b8da-a329dc44898a"
              }
              width={300}
              height={300}
              alt="Laeb Logo"
              style={{ margin: "auto" }}
            />
            <Heading style={global.heading}>Booking Confirmed.</Heading>
            <Text style={global.text}>
              You booking is reserved and confirmed. Use the link above to view.
            </Text>
            <Text style={{ ...global.text, marginTop: 24 }}>
              {paymentMethod === "card"
                ? `We´ve successfully charged your payment method for the cost of AED ${listingPrice}
            and will be removing any authorization holds.`
                : `You will be required to pay the total amount of AED ${
                    listingPrice ?? 250
                  } at the location.`}
            </Text>
          </Section>
          <Hr style={global.hr} />
          <Section style={global.defaultPadding}>
            <Text style={adressTitle}>{`Listing by: ${
              listingBy ?? "Hadaf Fields"
            }`}</Text>

            <Row>
              <Column style={{ width: 20 }}>
                <Img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR55MD5KnPP97bW1tK8GLtMAcK_abATDIZ5An8vk00mLQ&s"
                  width={10}
                  height={15}
                />
              </Column>
              <Column>
                <Text style={{ ...global.text, fontSize: 14 }}>
                  {listingLocation ?? "Al Nahda, Sharjah"}
                </Text>
              </Column>
            </Row>

            <Row>
              <Column width={20}>
                <Img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwg5LdnrGfEK54foYmlvDwFmT2CUS-uE6AHCw2Zvov3g&s"
                  width={15}
                  height={15}
                  style={{ marginTop: 2 }}
                />
              </Column>

              <Column>
                <Text style={{ ...global.text, fontSize: 14 }}>
                  {listingEmail ?? "laeb@gmail.com"}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column width={20}>
                <Img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuxh1wJH_JKzM451mDSiG1sVoW1I9ZS2hR1yIN50Z9MA&s"
                  width={15}
                  height={15}
                />
              </Column>
              <Column>
                <Text
                  style={{
                    ...global.text,
                    fontSize: 14,
                  }}
                >
                  {listingPhone ?? "+971 553452460"}
                </Text>
              </Column>
            </Row>
          </Section>
          <Section style={global.defaultPadding}>
            <Row style={{ display: "inline-flex", marginBottom: 40 }}>
              <Column style={{ width: "170px" }}>
                <Text style={global.paragraphWithBold}>Booking Date</Text>
                <Row
                  style={{
                    fontWeight: 500,
                    lineHeight: "1.4",
                    color: "#6F6F6F",
                  }}
                >
                  <Column width={30}>
                    <Img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPygr50bUe-wt_uTYx0rKgLtzIuv6kH9QBjBwCLb7aaA&s"
                      width={20}
                      height={20}
                    />
                  </Column>
                  <Column>
                    <Text>{listingDate ?? "Sep 22, 2022"}</Text>
                  </Column>
                </Row>
              </Column>
              <Column>
                <Text style={global.paragraphWithBold}>Booking Time</Text>
                <Row
                  style={{
                    fontWeight: 500,
                    lineHeight: "1.4",
                    color: "#6F6F6F",
                  }}
                >
                  <Column style={{ width: 30 }}>
                    <Img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD9orimtGcQUZEvjKWBzfoO6OdatEbwrLHo7PrrDiJJA&s"
                      width={20}
                      height={20}
                    />
                  </Column>
                  <Column>
                    <Text>{listingTime ?? "10:00 AM - 12:00 PM"}</Text>
                  </Column>
                </Row>
              </Column>
            </Row>
            <Row>
              <Column align="center">
                <Link
                  style={{ ...global.button, cursor: "pointer" }}
                  href={partnerPage}
                >
                  Visit their page
                </Link>
              </Column>
            </Row>
          </Section>
          <Hr style={global.hr} />
          <Section style={menu.container}>
            <Row>
              <Text style={menu.title}>Get in Touch with Laeb</Text>
            </Row>
            <Row style={{ ...menu.content, paddingBottom: "20px" }}>
              <Column>
                <Text style={global.paragraphWithBold}>Email</Text>
                <Row>
                  <Column width={20}>
                    <Img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwg5LdnrGfEK54foYmlvDwFmT2CUS-uE6AHCw2Zvov3g&s"
                      width={15}
                      height={15}
                      style={{ marginTop: 2 }}
                    />
                  </Column>

                  <Column>
                    <Text style={{ ...global.text, fontSize: 14 }}>
                      {laebEmail ?? "laeb@gmail.com"}
                    </Text>
                  </Column>
                </Row>
              </Column>
              <Column>
                <Text style={global.paragraphWithBold}>Phone</Text>
                <Row>
                  <Column width={20}>
                    <Img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuxh1wJH_JKzM451mDSiG1sVoW1I9ZS2hR1yIN50Z9MA&s"
                      width={15}
                      height={15}
                    />
                  </Column>
                  <Column>
                    <Text
                      style={{
                        ...global.text,
                        fontSize: 14,
                      }}
                    >
                      {listingPhone ?? "+971 553452460"}
                    </Text>
                  </Column>
                </Row>
              </Column>
            </Row>
            <Row style={{ ...menu.content, paddingTop: "0" }}>
              <Column>
                <Row
                  style={{
                    ...track.number,
                  }}
                >
                  <Column width={30}>
                    <Img
                      src={
                        "https://p7.hiclipart.com/preview/998/289/205/logo-grayscale-graphic-designer-instagram-customer-service.jpg"
                      }
                      height={20}
                      width={20}
                    />
                  </Column>
                  <Column>
                    <Text>{laebInstagram ?? "laebuae"}</Text>
                  </Column>
                </Row>
              </Column>
              <Column>
                <Row
                  style={{
                    ...track.number,
                  }}
                >
                  <Column width={30}>
                    <Img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjrk9QTZef2MogdSsCDFMB23yg3c_RBIhPgcCFGZ0dMg&s"
                      height={20}
                      width={20}
                    />
                  </Column>
                  <Column>
                    <Text>{laebFacebook ?? "laebuae"}</Text>
                  </Column>
                </Row>
              </Column>
              <Column>
                <Row
                  style={{
                    ...track.number,
                  }}
                >
                  <Column width={30}>
                    <Img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4ogDpwpBMeXYDihAgWIGzGyk2V5RxPazbgP8Oi210KQ&s"
                      height={20}
                      width={20}
                    />
                  </Column>
                  <Column>
                    <Text>{laebTwitter ?? "laebuae"}</Text>
                  </Column>
                </Row>
              </Column>
            </Row>
          </Section>
          <Hr style={{ ...global.hr, marginTop: "12px" }} />
          <Section style={paddingY}>
            <Row style={footer.policy}>
              <Column>
                <Text style={footer.text}>Web Version</Text>
              </Column>
              <Column>
                <Text style={footer.text}>Privacy Policy</Text>
              </Column>
            </Row>
            <Row>
              <Text
                style={{ ...footer.text, paddingTop: 30, paddingBottom: 30 }}
              >
                {
                  "Please contact us if you have any questions. (If you reply to this email, we won't be able to see it.)"
                }
              </Text>
            </Row>
            <Row>
              <Text style={footer.text}>
                {"© 2024 La'eb, Inc. All Rights Reserved."}
              </Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default TailwindEmail;

const paddingX = {
  paddingLeft: "40px",
  paddingRight: "40px",
};

const paddingY = {
  paddingTop: "22px",
  paddingBottom: "22px",
};

const paragraph = {
  margin: "0",
  lineHeight: "2",
};

const global = {
  paddingX,
  paddingY,
  defaultPadding: {
    ...paddingX,
    ...paddingY,
  },
  paragraphWithBold: { ...paragraph, fontWeight: "bold" },
  heading: {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: "-1px",
  } as React.CSSProperties,
  text: {
    ...paragraph,
    color: "#747474",
    fontWeight: "500",
  },
  button: {
    border: "1px solid #929292",
    fontSize: "16px",
    textDecoration: "none",
    padding: "10px 0px",
    width: "220px",
    display: "block",
    textAlign: "center",
    fontWeight: 500,
    color: "#000",
  } as React.CSSProperties,
  hr: {
    borderColor: "#E5E5E5",
    margin: "0",
  },
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "10px auto",
  width: "600px",
  maxWidth: "100%",
  border: "1px solid #E5E5E5",
};

const track = {
  container: {
    padding: "22px 40px",
    backgroundColor: "#F7F7F7",
  },
  number: {
    margin: "12px 0 0 0",
    fontWeight: 500,
    lineHeight: "1.4",
    color: "#6F6F6F",
  },
};

const message = {
  padding: "40px 74px",
  textAlign: "center",
} as React.CSSProperties;

const adressTitle = {
  ...paragraph,
  fontSize: "15px",
  fontWeight: "bold",
};

const recomendationsText = {
  margin: "0",
  fontSize: "15px",
  lineHeight: "1",
  paddingLeft: "10px",
  paddingRight: "10px",
};

const recomendations = {
  container: {
    padding: "20px 0",
  },
  product: {
    verticalAlign: "top",
    textAlign: "left" as const,
    paddingLeft: "2px",
    paddingRight: "2px",
  },
  title: { ...recomendationsText, paddingTop: "12px", fontWeight: "500" },
  text: {
    ...recomendationsText,
    paddingTop: "4px",
    color: "#747474",
  },
};

const menu = {
  container: {
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingTop: "20px",
    backgroundColor: "#F7F7F7",
  },
  content: {
    ...paddingY,
    paddingLeft: "20px",
    paddingRight: "20px",
  },
  title: {
    paddingLeft: "20px",
    paddingRight: "20px",
    fontWeight: "bold",
  },
  text: {
    fontSize: "13.5px",
    marginTop: 0,
    fontWeight: 500,
    color: "#000",
  },
  tel: {
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingTop: "32px",
    paddingBottom: "22px",
  },
};

const categories = {
  container: {
    width: "370px",
    margin: "auto",
    paddingTop: "12px",
  },
  text: {
    fontWeight: "500",
    color: "#000",
  },
};

const footer = {
  policy: {
    width: "166px",
    margin: "auto",
  },
  text: {
    margin: "0",
    color: "#AFAFAF",
    fontSize: "13px",
    textAlign: "center",
  } as React.CSSProperties,
};
