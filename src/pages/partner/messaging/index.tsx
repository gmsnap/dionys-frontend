import { ReactElement, useEffect, useState, useRef } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import useStore from '@/stores/partnerStore';
import type { NextPageWithLayout } from '@/types/page';
import {
  Box,
  Container,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Avatar,
  Stack,
  CircularProgress
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import LocationsDropDown from '@/features/partners/LocationsDropDown';
import { WaitIcon } from '@/components/WaitIcon';
import { Delete, Upload, X } from "lucide-react";
import PageHeadline from '@/features/partners/PageHeadline';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import DeleteIcon from '@mui/icons-material/Delete';

import { fetchEventConfigurationsByCompany } from '@/services/eventConfigurationService';

interface ChatMessage {
  id: number;
  conversationId: string;
  messageId: string;
  sender: string;
  receiver: string;
  subject: string;
  content: string;
  received: string;
  attachments: AttachmentFileData[];
}

interface EventConversation extends EventConfigurationModel {
  newMessage: number;
  formatedTime: string;
}

interface Conversation {
  id: string;
  amount: number;
}

interface AttachmentFileData {
  name: string;
  url: string;
}

const generateUploadUrlEndpoint =
    `${process.env.NEXT_PUBLIC_API_URL}/media/generate-image-upload-url`;

const MessagePage: NextPageWithLayout = () => {
  const { partnerUser, partnerLocations } = useStore();
  const [locationId, setLocationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<EventConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<EventConversation | null>(null);
  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<AttachmentFileData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  //const conversationID = "1744817512889"; // from db
  const sender = "booking@hans-reimer.com"; // from db
  const partnerId = "1";//partnerUser?.companyId;

  // we have to use it later
  let eventConfigurations = [] as EventConfigurationModel[];
  let eventConversations = [] as EventConversation[];


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
        
  useEffect(() => {

    const fetchConversationList = async () => {

      //const companyId = partnerUser?.companyId;
      if (!partnerId) {
          //return;
      }

      const confs = await fetchEventConfigurationsByCompany(
          Number.parseInt(partnerId),//partnerId,
          setIsLoading,
          setError
      );

      if (!confs) {
          //setEventConfs([]);
          setError("Error fetching Event Bookings");
          return;
      }

      const sortedConfs = confs.sort((
          a: EventConfigurationModel,
          b: EventConfigurationModel
      ) => b.id - a.id);

      eventConfigurations = sortedConfs;



      try {
        const res = await fetch(`http://localhost:3015/v1/partner/messages/getConversations/${partnerId}`);
        if (!res.ok) throw new Error(`Fehler: ${res.status}`);

        const data = await res.json() as Conversation[];

        eventConversations = [];

        // loop events
        for(const event of eventConfigurations)
        {
          // try to convert event to conversation
          let eventConversation = event as EventConversation;

          // now loop all 
          for (const conversation of data) 
          {
            //console.log(eventConversation.date);
            if(eventConversation.date)
            {
              const date = new Date(eventConversation.date);
              const germanDate = new Intl.DateTimeFormat('de-DE', {
                dateStyle: 'short',
                timeStyle: 'short',
                }).format(date);
                eventConversation.formatedTime = germanDate;
                //console.log(eventConversation.formatedTime);
            }


            if(conversation.id === event.id.toString())
            {
              eventConversation.newMessage = conversation.amount;
              
              break;
            }
          }
          eventConversations.push(eventConversation);
        }

        // get all requests from db, match the amounts to it.
        console.log(data);

        setConversations(eventConversations);
      } catch (err) {
        console.error('Fehler beim Laden der Konversationsliste:', err);
      }
    };

    fetchConversationList();
  }, []);

          
        
  const loadConversation = async (conv: EventConversation) => {
    try {
      const res = await fetch(`http://localhost:3015/v1/partner/messages/getConversationForId/${partnerId}/${conv.id}`);
      if (!res.ok) throw new Error(`Fehler: ${res.status}`);
      const data = await res.json() as ChatMessage[];
      console.log(JSON.stringify(data));
      setMessages(data);
      setCurrentConversation(conv);
    } catch (err) {
      console.error('Fehler beim Laden der Konversation:', err);
    }
  };
        

  // Handle image deletion

  const handleDeleteFile = (index: number) => {
    try {

      const file = selectedFile[index];
      if (!file) return;
      /*
      await fetch("/api/delete", {
          method: "POST",
          body: JSON.stringify({ file.url }),
          headers: { "Content-Type": "application/json" },
      });
      */

      // Notify parent about the deleted image
      setSelectedFile(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
        console.error("Image delete failed", error);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) 
    {
      setUploading(true);
      const file = event.target.files[0];

      setSelectedFile((prev) => [...prev, file]);
      
      try {
        // Call API to get presigned URL and upload the file
        const response = await fetch(generateUploadUrlEndpoint, {
          method: "POST",
          body: JSON.stringify({ image: file.name }),
          headers: { "Content-Type": "application/json" },
        });
        const { uploadUrl, imageUrl } = await response.json();

        // Upload to S3 or server
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });

        const fileData = {
          name: file.name,
          url: imageUrl,
        } as AttachmentFileData;

        setUploadedFileUrls((prev) => [...prev, fileData]); 
      } catch (error) {
        console.error("Image upload failed", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const getRequestTime = (created: string) => {
    const now = Date.now(); // aktuelle Zeit in Millisekunden
    const createdDate = new Date(created).getTime();
    //console.log("now: ", now);
    //console.log("now format: ", getDayFormatted(now));
    //console.log("then: ", createdDate);
    //console.log("then format: ", getDayFormatted(createdDate));
    //const inputTime = conf; // Unix-Timestamp ist in Sekunden → umrechnen in Millisekunden
    const diffMs = now - createdDate;

    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;
    const sixDays = 6 * oneDay;

    if (diffMs > sixDays) {
      return 'am ' + getDayFormatted(createdDate); // z. B. "22.05.2025"
    }

    if (diffMs < oneHour) {
      const minutes = Math.floor(diffMs / oneMinute);
      return `vor ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
    }

    if (diffMs < oneDay) {
      const hours = Math.floor(diffMs / oneHour);
      return `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
    }

    const days = Math.floor(diffMs / oneDay);
    return `vor ${days} Tag${days !== 1 ? 'e' : ''}`;
  }

  const getDayTime = (conf: number) => {
    const startTime = conf ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf)) : '?';
    return `${startTime} Uhr`;
  }

  const getDayFormatted = (conf: number) => {
    const startDate = conf ? new Intl.DateTimeFormat('de-DE').format(new Date(conf)) : '?';
    const startDay = conf ? new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(new Date(conf)) : '?';
    return `${startDay}, ${startDate}`;
  }

  const formatDates = (conf: EventConfigurationModel) => {
    const startDate = conf.date ? new Intl.DateTimeFormat('de-DE').format(new Date(conf.date)) : '?';
    const startTime = conf.date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.date)) : '?';
    const endTime = conf.endDate ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.endDate)) : '?';
    return `${startDate}, ${startTime} - ${endTime} Uhr`;
  }

        
  const handleSend = async () => {

    if (!newMessage || !currentConversation) return;
  
    let lastReceived;
    for (const msg of messages) {
      if (msg.receiver === sender) {
        lastReceived = msg;
      }
    }
  
    if (!lastReceived) {
      lastReceived = {
        sender : currentConversation.booker?.email ?? '',
        subject : "Buchungsanfrage Location " + currentConversation.location?.title,
        messageId : ''
      }
    }
          
    // create form data
    const formData = new FormData();
    formData.append('partnerId', partnerId?.toString() || '');
    formData.append('conversation', currentConversation.id.toString() || '');
    formData.append('sender', sender);
    formData.append('receiver', lastReceived.sender);
    formData.append('subject', lastReceived.subject);
    formData.append('inreplyto', lastReceived.messageId);
    formData.append('content', newMessage);
    formData.append('attachments', JSON.stringify(uploadedFileUrls));
  
    // send message data to api
    const res = await fetch(`http://localhost:3015/v1/partner/messages/sendMessageForConversation/`, {
      method: 'POST',
      body: formData,
    });
         
    
    if (res.ok) {
      const responseData = await res.json();
      //console.log("response: ", JSON.stringify(responseData));
      setMessages((prev) => [...prev, responseData]);
      setNewMessage('');
      setSelectedFile([]);
      setUploadedFileUrls([]); // Clear after send
    } else {
      alert('Fehler beim Senden der Nachricht.');
    }
  };

  return (
    <Box>
      <PageHeadline title='Messages' />
      <Box sx={{
          mt: { xs: 5, md: 10 },
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          ml: 2,
          mb: 5
        }}>
      </Box>
      <Container >
        <Box display="flex" height="65vh" mt={4}>
          {/* Linke Spalte: Konversationen */}
          <Box
            width="20%"
            borderRight="1px solid #ccc"
            pr={2}
            sx={{ overflowY: 'auto' }}
          >
            <Typography variant="h6" gutterBottom>
              Posteingang
            </Typography>
            <List>
              {conversations.map(conv => (
                <ListItem
                  key={conv.id}
                  button
                  onClick={() => loadConversation(conv)}
                  selected={conv.id === currentConversation?.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: conv.id === currentConversation?.id ? '#e6f5fa' : '#eeeeee',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between', // Verteilt Inhalt links und rechts
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Typography sx={{ fontSize: '14px', textAlign: 'left', margin: '0px' }} gutterBottom>
                    {`Anfrage ${conv.id}: ${conv.location?.title}`}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', textAlign: 'right', fontWeight: 'bold', margin: '0px' }} gutterBottom>
                    {conv.newMessage ? `Neue Nachrichten: ${conv.newMessage}` : ''}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Rechte Spalte: Chat */}
          <Box width="50%" pl={2} display="flex" flexDirection="column">
            <Typography sx={{ fontSize: '18px', textAlign: 'center' }} variant="h4" gutterBottom>
              {currentConversation ? `${currentConversation.booker?.givenName} ${currentConversation.booker?.familyName} | Anfrage für ${currentConversation.formatedTime} | ${currentConversation.location?.title} | ${currentConversation.location?.title}` : 'Keine Konversation ausgewählt'}
            </Typography>
            <Paper elevation={3} sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
              <List>
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender === sender;
                  return (
                    <ListItem key={msg.id} sx={{ display: 'flex', justifyContent: 'center', px: 0 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, visibility: isOwnMessage ? 'hidden' : 'visible' }}>
                        {msg.sender.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ maxWidth: '70%', width: '100%' }}>
                        <Box sx={{ bgcolor: isOwnMessage ? '#edf2f5' : '#e6f5fa', borderRadius: 2, px: 2, py: 1 }}>
                          <Typography textAlign={isOwnMessage ? 'right' : 'left'} variant="body1">{msg.content}</Typography>
                          {/* Falls Dateianhänge vorhanden sind */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <Box mt={1}>
                              {msg.attachments.map((attachment: { name: string; url: string }, index: number) => (
                                <Box key={index} textAlign={isOwnMessage ? 'right' : 'left'}>
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', color: '#1976d2' }}
                                  >
                                    📎 {attachment.name}
                                  </a>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                        <Typography variant="caption" display="block" textAlign={isOwnMessage ? 'right' : 'left'} mt={0.5} color="text.secondary">
                          {msg.sender} • {new Date(msg.received).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Avatar sx={{ width: 32, height: 32, ml: 1, visibility: !isOwnMessage ? 'hidden' : 'visible' }}>
                        {msg.sender.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItem>
                  );
                })}
                <div ref={messagesEndRef} />
              </List>
            </Paper>

            {currentConversation && (
            <Box mt={2}>
              <TextField
                label="Deine Antwort"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
              <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  variant="contained"
                  sx={{ borderRadius: 0, backgroundColor: '#002a58', '&:hover': { backgroundColor: '#002a58' } }}
                  onClick={handleSend}
                >
                  Antworten
                </Button>
                <IconButton
                  component="label"
                  sx={{ borderRadius: 0, backgroundColor: '#002a58', color: '#fff', '&:hover': { backgroundColor: '#002a58' } }}
                >
                  <AttachFileIcon />
                  <input type="file" hidden onChange={handleFileChange} />
                </IconButton>
              </Box>
              {selectedFile.length > 0 && (
              <Box mt={1}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Ausgewählte Dateien:
                </Typography>
                <List>
                  {selectedFile.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={file.name} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              )}
            </Box>
            )}
          </Box>
          <Box width="30%">
            {currentConversation && (
              <Box sx={{
                mt: { xs: 2, md: 2 },
                pt: { xs: 2, md: 2 },
                ml: 2,
                pl: 2,
                pr: 2,
                width: '100%',
                bgcolor: '#f2f2f2',
              }}>
              <Typography gutterBottom>
                {`Anfrage ${currentConversation.id}`}
              </Typography>
              <Typography gutterBottom>
                {`Angefragt ${getRequestTime(currentConversation.createdAt)}`}
              </Typography>
              <Typography sx={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', pt: 3, }} gutterBottom>
                {`${currentConversation.booker?.givenName} ${currentConversation.booker?.familyName}`}
              </Typography>
              <Typography sx={{ fontSize: '18px', textAlign: 'center' }} gutterBottom>
                { currentConversation.booker?.bookingCompany ? `${currentConversation.booker?.bookingCompany}` : ''}
              </Typography>
              <Box>
                <Box sx={{
                  mt: { xs: 3, md: 3 },
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  ml: 2,
                  mb: 5
                }}>
                  <Box width="50%">
                    <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                      Start
                    </Typography>
                    <Typography gutterBottom>
                      {`${getDayTime(currentConversation.date ? currentConversation.date : 0)}`}  
                    </Typography>
                    <Typography gutterBottom>
                      {`${getDayFormatted(currentConversation.date ? currentConversation.date : 0)}`}  
                    </Typography>
                  </Box>
                  <Box width="50%">
                    <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                      Ende
                    </Typography>
                    <Typography gutterBottom>
                      {`${getDayTime(currentConversation.endDate ? currentConversation.endDate : 0)}`}
                    </Typography>
                    <Typography gutterBottom>
                      {`${getDayFormatted(currentConversation.endDate ? currentConversation.endDate : 0)}`}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{
                    mt: { xs: 1, md: 1 },
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    ml: 2,
                    mb: 5
                  }}>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        Anzahl Personen
                      </Typography>
                      <Typography gutterBottom>
                        {`${currentConversation.persons} Personen`}
                      </Typography>
                    </Box>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        Event Kategorie
                      </Typography>
                      <Typography gutterBottom>
                        {`${currentConversation.eventCategory}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{
                    mt: { xs: 1, md: 1 },
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    ml: 2,
                    mb: 5
                  }}>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        Räume
                      </Typography>
                      {currentConversation.rooms?.map((room, index) => (
                        <Typography key={index}>
                          {room.name}
                        </Typography>
                      ))}
                    </Box>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        Leistungen
                      </Typography>
                      {currentConversation.roomExtras?.map((extra, index) => (
                        <Typography key={index}>
                          {extra.seating}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{
                    mt: { xs: 1, md: 1 },
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    ml: 2,
                    mb: 5
                  }}>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        Angebotspreis
                      </Typography>
                      <Typography gutterBottom>
                        €7.800 (Brutto) 
                      </Typography>
                    </Box>
                    <Box width="50%">
                      
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{
                    mt: { xs: 1, md: 1 },
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    ml: 2,
                    mb: 5
                  }}>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        Telefon
                      </Typography>
                      <Typography gutterBottom>
                        {`${currentConversation.booker?.phoneNumber}`}
                      </Typography>
                    </Box>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        E-Mail
                      </Typography>
                      <Typography gutterBottom>
                        {`${currentConversation.booker?.email}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{
                    mt: { xs: 1, md: 1 },
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    ml: 2,
                    mb: 5
                  }}>
                    <Box width="50%">
                      <Typography sx={{fontWeight: 'bold'}} gutterBottom>
                        Rechnungsanschrift
                      </Typography>
                      <Typography gutterBottom>
                        {`${currentConversation.booker?.bookingCompany?.streetAddress}`}
                      </Typography>
                    </Box>
                    <Box width="50%">
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>   
  );
};

// Use ClientLayout as the layout for this page
MessagePage.getLayout = function getLayout(page: ReactElement) {
  return (
    <PartnerLayout>
      <PartnerContentLayout>
        {page}
      </PartnerContentLayout>
    </PartnerLayout>
  );
};

export default MessagePage;