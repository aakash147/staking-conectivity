import { Box, Container, Button } from "@mui/material";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import {
  useStakingContract,
  useTokenContract,
} from "../../ConnectivityAss/hooks";
import { AppContext } from "../../utils";
import { stakingAddress } from "../../ConnectivityAss/environment";

function createData(amount, withdrawtime, button) {
  return { amount, withdrawtime, button };
}

const rows = [
  createData(2, "June 12-6-2022", "Claim"),
  createData(3, "June 15-6-2022", "Unstake"),
];

const StyledButtton = ({ children, ...props }) => {
  return (
    <Button
      disableRipple={true}
      {...props}
      sx={{
        backgroundColor: "#adff2f",
        height: "42px",
        width: "150px",
        marginLeft: "20px",
        fontSize: "14px",
        fontWeight: "700",
        "&:hover": {
          backgroundColor: "#adff2fa1",
        },
      }}
    >
      {children}
    </Button>
  );
};

function Home() {
  let { account, signer } = useContext(AppContext);
  let [amount, setAmount] = useState("");
  let [indexplan, setIndexplan] = useState(0);
  let [profit, setProfit] = useState("");

  let stackingContract = useStakingContract(signer);
  console.log(stackingContract);
  let tokenContract = useTokenContract(signer);
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       let totalStaked = await stackingContract.totalStakedToken();
  //       console.log(formatUnits(totalStaked), "total staked Token");

  //       let totalUnstake = await stackingContract.totalUnStakedToken();
  //       console.log(formatUnits(totalUnstake), "total unstaked token");

  //       let totalStaker = await stackingContract.totalStakers();
  //       console.log(+totalStaker, "total stakers");
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   init();
  // }, []);

  // ------------Getting bonus of staking function-----------

  useEffect(() => {
    const init = async () => {
      try {
        let percentDivide = await stackingContract.percentDivider();
        console.log(+percentDivide, "Percent Divider function");

        let bonus = await stackingContract.Bonus(+indexplan);

        let percentage = (+bonus / +percentDivide) * amount;
        console.log(percentage, "Profit percentage");

        setProfit(+amount + +percentage);
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, [amount, indexplan]);

  ///////////////////////////////////////////////////////////

  //----------Stakers informations-------------

  useEffect(() => {
    const checkStackers = async () => {
      try {
        let {
          totalStakedTokenUser,
          totalWithdrawanTokenUser,
          alreadyExists,
          stakeCount,
          totalClaimedRewardTokenUser,
          totalUnStakedTokenUser,
        } = await stackingContract.Stakers(
          "0xEA9f0c9a4393AcE8cACd21B022c1334b4e6d0E2C"
        );
        console.log(
          +totalStakedTokenUser,
          +totalWithdrawanTokenUser,
          alreadyExists,
          +stakeCount,
          +totalClaimedRewardTokenUser,
          +totalUnStakedTokenUser
        );
      } catch (error) {
        console.log(error);
      }
    };

    if (account) {
      checkStackers();
    }
  }, [account]);

  /////////////////////////////////////////////

  // ---------Stake write function---------
  const stakeHandler = async () => {
    try {
      if (account) {
        let decimals = await tokenContract.decimals();
        console.log(+decimals, "decimals");
        const approveFuction = await tokenContract.approve(
          stakingAddress,
          parseUnits(amount.toString(), +decimals)
        );
        await approveFuction.wait();
        const transation = await stackingContract.stake(
          parseUnits(amount.toString(), +decimals),
          indexplan.toString()
        );
        // await approveFuction.wait();
        await transation.wait();
        console.log(transation);
        toast.success("confirmed transation");
      } else {
        toast.error("please connect wallet");
      }
    } catch (error) {
      console.log(error);
    }
  };
  /////////////////////////////////////////
  return (
    <Box>
      <Container>
        <Box component="h1" color="green">
          Home Component
        </Box>

        <Box>
          <input
            placeholder="Enter amount: "
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              height: "42px",
              width: "300px",
            }}
          />
        </Box>
        <Box mt={3}>
          <StyledButtton onClick={() => setIndexplan(0)}>7 days</StyledButtton>
          <StyledButtton onClick={() => setIndexplan(1)}>14 days</StyledButtton>
          <StyledButtton onClick={() => setIndexplan(2)}>21 days</StyledButtton>
          <StyledButtton onClick={() => setIndexplan(3)}>30 days</StyledButtton>
        </Box>

        <Box
          mt={2}
          py={2}
          border="1px solid #d1d1d1"
          textAlign="center"
          color="black"
          width="50%"
        >
          {profit}
        </Box>

        <Box mt={3}>
          <StyledButtton onClick={stakeHandler}>stake handler</StyledButtton>
        </Box>

        {/* ----------table of unstake and Claim------------ */}
        <Box mt={5}>
          <TableContainer component={Paper} border="none">
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ color: "black", fontWeight: "600" }}
                  >
                    Staked Amount
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "black", fontWeight: "600" }}
                  >
                    Withdrawal Time
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "black", fontWeight: "600" }}
                  >
                    Claim/Unstake
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow>
                    <TableCell align="center" sx={{ color: "black" }}>
                      {row.amount}
                    </TableCell>
                    <TableCell align="center" sx={{ color: "black" }}>
                      {row.withdrawtime}
                    </TableCell>
                    <TableCell align="center">
                      <StyledButtton>{row.button}</StyledButtton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
