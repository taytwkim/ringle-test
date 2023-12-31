import * as React from 'react';
import { useState, useEffect } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import { format } from 'date-fns';
import koLocale from 'date-fns/locale/ko';
import { useSelector, useDispatch } from 'react-redux'
import { addReserved, decrement20, decrement40 } from '../app/userSlice';
import { tutorAddReserved } from '../app/tutorSlice';

// check if selected range is within available range
// Note that the dates are type string
function checkAvailable(selectedRange, availableRange){
  return new Date(availableRange.start) <= selectedRange.from && selectedRange.to <= new Date(availableRange.end);
}

export default function TutorsList(props) {
  const dispatch = useDispatch();
  const tutors = useSelector((state) => state.tutor); // list of every tutor (not filtered)
  const userID = useSelector((state) => state.user.userID);
  const num20 = useSelector((state) => state.user.numLessons20);
  const num40 = useSelector((state) => state.user.numLessons40);

  const [loading, setLoading] = useState("false");
  const [tutorsFiltered, setTutorsFiltered] = useState(tutors); // list of tutors that meet the condtions
  const [gender, setGender] = useState("");
  const [accent, setAccent] = useState("");
  const [majorType, setMajorType] = useState("");

  useEffect(()=>{
    // Filter tutors for availability, gender, accent, and major type
    function filterTutors(){
      const filtered = [];
      
      for (let i = 0; i < tutors.length; i++){
        if (gender !== 0 && gender !== "" && gender !== tutors[i].gender){continue;}
        if (accent !== 0 && accent !== "" && accent !== tutors[i].accent){continue;}
        if (majorType !== 0 && majorType !== "" && majorType !== tutors[i].majorType){continue;}
        
        if (tutors[i].available.length > 0){
          let available = false;
          for (let j = 0; j < tutors[i].available.length; j++){
            if (checkAvailable(props.selectedRange, tutors[i].available[j])){
              available = true
              break;
            }
          }
          if (!available){continue;}
        }

        filtered.push(tutors[i]);
      }
      setTutorsFiltered(filtered);
    }

    setLoading(true);
    filterTutors()
    setLoading(false);
  }, [tutors, gender, accent, majorType, props.selectedRange]);
  
  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };
  
  const handleAccentChange = (event) => {
    setAccent(event.target.value);
  };
  
  const handleMajorTypeChange = (event) => {
    setMajorType(event.target.value);
  };

  // Add new event when a tutor is clicked
  const handleTutorClick = (tutorIndex, tutorID, tutorName) => {
    if (props.eventType === 20 && num20 === 0){
      alert("수업권이 부족합니다.");
    }
    else if (props.eventType === 40 && num40 === 0){
      alert("수업권이 부족합니다.");
    }
    else{
      if (props.eventType === 20){
        dispatch(decrement20());
      }
      if (props.eventType === 40){
        dispatch(decrement40());
      }

      const eventID = "E000" + props.eventIDIndex.toString();
      props.setEventIDIndex(props.eventIDIndex + 1);

      const eventStart = props.selectedRange.from;
      const eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventStart.getMinutes() + props.eventType);
      
      const event = {
        eventID: eventID,
        eventType: props.eventType,
        title: "예약 완료",
        userID: userID,
        tutorID: tutorID,
        tutorName: tutorName,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString()
      };

      // console.log(JSON.stringify(event));
      
      dispatch(addReserved(event));
      dispatch(tutorAddReserved({
        tutorIndex: tutorIndex,
        event: event 
      }))
      props.setSelected(false);
    }
  };
  
  return (
    <div>
      <Typography variant='h6'>{format(props.selectedRange.from, 'PPP EEE p', { locale: koLocale })}</Typography>
      <Divider sx={{marginBottom:2}} variant="fullWidth"/>

      <Typography variant='h7'>튜터 직접 선택</Typography>

      <Box sx={{marginTop:2}}>
        <FormControl sx={{height: 15, width: 90}}>
          <InputLabel id="demo-simple-select-disabled-label">성별</InputLabel>
          <Select
            sx = {{height: 50}}
            labelId="demo-simple-select-disabled-label"
            id="demo-simple-select-disabled"
            value={gender}
            label="Gender"
            onChange={handleGenderChange}
          >
            <MenuItem value={0}>상관없음</MenuItem>
            <MenuItem value={1}>여자</MenuItem>
            <MenuItem value={2}>남자</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{width: 90}}>
          <InputLabel id="demo-simple-select-error-label">억양</InputLabel>
          <Select
            sx = {{height: 50}}
            labelId="demo-simple-select-error-label"
            id="demo-simple-select-error"
            value={accent}
            label="Accent"
            onChange={handleAccentChange}
          >
            <MenuItem value={0}>상관없음</MenuItem>
            <MenuItem value={1}>미국식</MenuItem>
            <MenuItem value={2}>영국식</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{width: 90}}>
          <InputLabel id="demo-simple-select-readonly-label">전공</InputLabel>
          <Select
            sx = {{height: 50}}
            labelId="demo-simple-select-readonly-label"
            id="demo-simple-select-readonly"
            value={majorType}
            label="Major Type"
            onChange={handleMajorTypeChange}
          >
            <MenuItem value={0}>상관없음</MenuItem>
            <MenuItem value={1}>사회과학경영</MenuItem>
            <MenuItem value={2}>인문계</MenuItem>
            <MenuItem value={3}>공과계열</MenuItem>
            <MenuItem value={4}>자연과학계열</MenuItem>
            <MenuItem value={5}>예체능</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{marginTop:2}}>
        <ButtonGroup fullWidth size="secondary" aria-label="secondary button group">
          <Button key="one">예약 가능</Button>
          <Button disabled key="two">추천 튜터</Button>
          <Button disabled key="three">찜한 튜터</Button>
        </ButtonGroup>
      </Box>
      
      {
        tutorsFiltered.length === 0
        ? <Typography variant='body2' sx={{marginTop:2}}>수업 가능한 튜터가 없습니다.</Typography>
        : <Typography variant='body2' sx={{marginTop:2}}>선택한 시간에 수업 가능한 튜터들입니다.</Typography>
      }

      {
      loading 
      ? <Box sx={{ mt: 7, textAlign: 'center' }}><CircularProgress /></Box> :
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {
        tutorsFiltered.map(function(tutor, i){
          return(
            <>
              <ListItem alignItems="flex-start" onClick={()=>{
                handleTutorClick(i, tutor.tutorID, tutor.name)
                }} sx={{ '&:hover': { backgroundColor: '#f0f0f0' }, cursor: 'pointer'}}>
                <ListItemAvatar>
                  <Avatar alt={tutor.name} src="/static/images/avatar/1.jpg" />
                </ListItemAvatar>
                <ListItemText
                  primary={tutor.name}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {tutor.school}
                      </Typography>
                      <Typography variant='body2'>
                        {tutor.major}
                      </Typography>
                      <Typography variant='body2'>
                        수락율: {tutor.acceptanceRate}%
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider variant="fullWidth" component="li" />
            </>
          )
        })
        }
      </List>
      }
    </div>
  );
}