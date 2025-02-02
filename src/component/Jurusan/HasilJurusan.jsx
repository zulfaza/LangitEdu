import React, { useState, useEffect } from "react";
import Styled from "@emotion/styled";
import BackButton from "./BackButton";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/Firebase";

const HasilJurusan = ({ jurusan, univ, setstep, area, kluster, nilai }) => {
  const [savedJurusan, setsavedJurusan] = useState(null);
  const [KampusCode, setKampusCode] = useState(0);
  const [Loading, setLoading] = useState(true);
  const [SaveLoading, setSaveLoading] = useState(true);
  const { currentUser } = useAuth();
  const [ProdiDetail, setProdiDetail] = useState({});
  const [popError, setpopError] = useState('');

  useEffect(() => {
    async function getProdiData() {
      setLoading(true);
      const resUniv = await db
        .collection("University")
        .where("nama", "==", univ)
        .limit(1)
        .get()
        .then((res) => {
          return res.docs[0].data();
        });
      setKampusCode(resUniv.code);
      const DetailProdi = await db
        .collection("Jurusans")
        .where("Campus_Code", "==", resUniv.code)
        .where("Study_Program", "==", jurusan)
        .get()
        .then((res) => {
          return res.docs[0].data();
        });
      setProdiDetail(DetailProdi);
      setLoading(false);
    }
    async function CheckedSavedJurusan() {
      const hasilSavedJurusan = await db
        .collection("ListHasilRekomendasi")
        .where("uid", "==", currentUser.uid)
        .where("jurusan", "==", jurusan)
        .where("univ", "==", univ)
        .limit(1)
        .get()
        .then((res) => {
          if (res.empty) {
            return {
              jurusan: "initial",
            };
          }
          return res.docs[0].data();
        });
      setsavedJurusan(hasilSavedJurusan.jurusan);
      setSaveLoading(false);
    }
    CheckedSavedJurusan();
    getProdiData();
    return () => {
      setLoading(false);
    };
  }, [univ, jurusan, currentUser]);

  const handleSaveJurusan = async () => {
    setSaveLoading(true);
    try {
      await db.collection("ListHasilRekomendasi").add({
        uid: currentUser.uid,
        area: area,
        kluster: kluster,
        jurusan: jurusan,
        univ: univ,
        nilai: nilai,
        KampusCode: KampusCode,
      });
      setsavedJurusan(jurusan);
      setSaveLoading(false);
    } catch (err) {
      setSaveLoading(false);
      console.log(err);
      setpopError(err.message)
    }
  };

  return (
    <Wrapper>
      <div className="header-detail">
        <h2>{jurusan}</h2>
      </div>
      {Loading ? (
        <div className="spinner-border" role="status"></div>
      ) : (
        <>
          <div className="each-univ">
            <div
              className="img"
              style={{
                background: `url('/img/jurusan/univ.svg'), ${"#676726"}`,
              }}
            ></div>
            <p>{univ}</p>
          </div>
          <div className="data-basic">
            <p>Status</p>
            <div className="box">
              <p>{ProdiDetail.Status}</p> {/* nanti merah kalo tutup */}
            </div>
          </div>
          <div className="data-basic">
            <p>Akreditasi</p>
            <div className="box">
              <p>{ProdiDetail.Accreditation}</p>
            </div>
          </div>
          <div className="jumlah-orang">
            <div className="box">
              <p className="number">
                {ProdiDetail.Number_of_Permanent_Lecturers}
              </p>
              <div>
                <div className="line"></div>
                <p className="text">Pengajar/Dosen</p>
              </div>
            </div>
            <div className="box">
              <p className="number">{ProdiDetail.Number_of_Students}</p>
              <div>
                <div className="line"></div>
                <p className="text">Mahasiswa</p>
              </div>
            </div>
          </div>
          <div className="rasio-cont">
            <div className="rasio">
              <p>Rasio {ProdiDetail.Ratio}</p>
            </div>
          </div>
        </>
      )}

      <div className="back">
        <BackButton tostep={4} setstep={setstep} />
        <button
          className={`btn-bordered${savedJurusan === jurusan ? "-gray" : ""}`}
          onClick={handleSaveJurusan}
        >
          {SaveLoading ? (
            <>
              <div
                className="spinner-border text-light mr-2 spinner-border-sm"
                role="status"
              ></div>
              {"Loading"}
            </>
          ) : savedJurusan !== jurusan ? (
            "SIMPAN JURUSAN"
          ) : (
            "TERSIMPAN"
          )}
        </button>
      </div>
      {popError !== '' && <ErrorPop message={popError} setpopError={setpopError}/>}
    </Wrapper>
  );
};

const ErrorPop = ({message, setpopError}) => {
  return (
    <div className="error-pop">
      <p>{message}</p>
      <div onClick={() => setpopError('')}>
        <i className="fas fa-plus"></i>
      </div>
    </div>
  )
}

const Wrapper = Styled.div(`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 24px 0;

    .error-pop{
      max-width: 553px;
      width: 90%;
      min-width: 320px;
      background: #FFCB1144;
      border: 1px solid red;
      margin-top: 32px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      
      p{
        padding: 12px 24px;
      }
      div{
        cursor: pointer;
        padding-top: 4px;
        i{
          padding: 12px;
          transform: rotate(45deg);
        }
      }
    }

    .rasio-cont{
        max-width: 553px;
        width: 90%;
        min-width: 320px;
        padding: 0 8px;
        margin-top: 12px;
    }

    .rasio{
        height: 100%;
        width: 100%;
        border: 1px solid gray;
        border-radius: 12px;
        padding: 24px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-family: Montserrat;
        font-style: normal;
        font-weight: bold;
        font-size: 28px;
        line-height: 34px;
        text-align: center;

        color: #1D1D1D;
    }

    .jumlah-orang{
        max-width: 553px;
        width: 90%;
        min-width: 320px;
        margin-top: 32px;

        display: flex;
        justify-content: center;
        align-items: center;

        padding: 0 -8px;

        .box{
            margin: 8px;
            width: 264px;
            height: 158px;

            background: #FFFFFF;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.5);
            border-radius: 8px;

            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: column;

            div{
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }

            p.number{
                font-family: Montserrat;
                font-style: normal;
                font-weight: bold;
                font-size: 39px;
                line-height: 48px;
                color: #1D1D1D;
                margin-top: 32px;
            }

            p.text{
                font-family: Montserrat;
                font-style: normal;
                font-weight: 600;
                font-size: 19px;
                line-height: 23px;

                color: #575757;
                margin: 12px;
            }

            .line{
                width: 100%;
                height: 1px;
                background: #CCC;
            }
            
        }

    }

    .data-basic{
        max-width: 553px;
        width: 90%;
        min-width: 320px;
        margin: 12px 0;
        padding: 0 0 0 12px;

        display: flex;
        justify-content: space-between;
        align-items: center;

        font-family: Raleway;
        font-style: normal;
        font-weight: bold;
        font-size: 39px;
        line-height: 46px;
        /* identical to box height */


        color: #1D1D1D;

        .box{
            width: 173px;
            height: 84px;

            display: flex;
            justify-content: center;
            align-items: center;

            border: 1px solid #C7C7C7;
            box-sizing: border-box;
            border-radius: 8px;

            font-family: Raleway;
            font-style: normal;
            font-weight: bold;
            font-size: 28px;
            line-height: 33px;
            text-align: center;

            color: #15B86A;
        }
    }
    
    .back{
        margin-top: 32px;
        max-width: 560px;
        width: 90%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    p.instruction{
        font-family: Montserrat;
        font-style: normal;
        font-weight: 800;
        font-size: 32px;
        margin: 24px 0;
        line-height: 54px;
        
        text-align: center;
        
        color: #007A95;
    }
    div.desc{   
        max-width: 553px;
        width: 90%;
        min-width: 320px;
        margin: 24px 0;
        p{
            text-align: center;
        }
    }
    .header-detail{
        max-width: 553px;
        width: 90%;
        min-width: 320px;
        padding: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        
        h2{
            font-family: Raleway;
            font-style: normal;
            font-weight: bold;
            font-size: 39px;
            line-height: 46px;
            text-align: center;
            
            /* Gray 1 */
            
            color: #333333;
            text-transform: uppercase;
        }
    }
    
    .each-univ{
        max-width: 553px;
        width: 90%;
        min-width: 320px;
        padding: 24px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin: 12px 0 32px 0;

        background: #FFFFFF;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.5);
        border-radius: 8px;

        div.img{
            height: 74px;
            width: 74px;
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius: 50%;
            margin-right: 24px;
        }

        p{
            font-family: Raleway;
            font-style: normal;
            font-weight: bold;
            font-size: 28px;
            line-height: 33px;
            text-transform: capitalize;

            /* Gray 1 */

            color: #333333;
        }
    }
`);

export default HasilJurusan;
