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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  useTheme,
  Avatar,
  ListItemButton,
  useMediaQuery} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import PageHeadline from '@/features/partners/PageHeadline';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { WaitIcon } from '@/components/WaitIcon';
import { WaitIconSmall } from '@/components/WaitIconSmall';
import { BookingRoom, calculateBooking, calculateBookingPrice, FormatPrice } from "@/utils/pricingManager";
import { RoomPricingModel, toPricingSlot } from "@/models/RoomPricingModel";

import { fetchEventConfigurationsByCompany } from '@/services/eventConfigurationService';
import { useAuthContext } from '@/auth/AuthContext';
import dynamic from 'next/dynamic';

const SortDropdown = dynamic(() => import('@/pages/partner/messaging/SortDropdown'), {
    ssr: false,
  });


import { SortOption } from '@/pages/partner/messaging/SortDropdown';

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
  unreadMessages: number;
  formatedTime: string;
  extract: string;
  messages: number;
  answered: boolean;
  lastMessage: string;
  style: object;
}

interface Conversation {
  id: string;
  entries: number;
  extract: string;
  received: string;
  unread: number;
}

interface AttachmentFileData {
  name: string;
  url: string;
}
const generateUploadUrlEndpoint =
  `${process.env.NEXT_PUBLIC_API_URL}/media/generate-image-upload-url`;

let currentEventConfiguration: EventConversation | null = null;

const MessagePage: NextPageWithLayout = () => {
  const theme = useTheme();
  const { authUser } = useAuthContext();
  const partnerUser = useStore((state) => state.partnerUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<EventConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<EventConversation | null>(null);
  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<AttachmentFileData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConvLoading, setIsConvLoading] = useState<boolean>(true);

  const [roomPricings, setRoomPricings] = useState<RoomPricingModel[] | null>(null);

  const [viewArea, setViewArea] = useState<number>(0);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  

  const sender = "Booking@VillaHirschberg.onmicrosoft.com"; // from db

  const [sortOption, setSortOption] = useState<SortOption>(SortOption.None);

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    currentEventConfiguration = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
  }, [conversations]);

  useEffect(() => {
    if (!partnerUser || !authUser) {
      return;
    }

    const fetchConversationList = async () => {
      await loadConversationsListFromServer(setIsLoading);
      //await loadConversationsListFromServer();
    };

    fetchConversationList();

    const interval = setInterval(async () => {
      await loadConversationsListFromServer(setIsLoading);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [partnerUser, authUser]);

  const formatRooms = (conf: EventConfigurationModel) => {
          const rooms = conf.rooms;
  
          if (!(rooms && conf && conf.date && conf.endDate && conf.persons)) {
              return <Typography>?</Typography>;
          }
  
          return rooms.map((room) => {
              const pricings = roomPricings?.filter((p) => p.roomId === room.id);
              const name = room.name ?? "?";
              const price = FormatPrice.formatPriceWithType({
                  price: calculateBookingPrice({
                      bookingStart: new Date(conf.date!),
                      bookingEnd: new Date(conf.endDate!),
                      persons: conf.persons!,
                      basePrice: room.price,
                      basePriceType: room.priceType,
                      excludeExclusive: conf.roomExtras?.some(r => r.roomId === room.id) !== true,
                      schedules: pricings ?? undefined,
                      isSingleOperation: true,
                  }).total,
              });
              const isExclusive = room.RoomsEventConfigurations?.isExclusive === true;
              return (
                  <Typography key={name}>
                      {price}
                  </Typography>
              );
          });
      };


  const sortConversations = (convs: EventConversation[], option: SortOption): EventConversation[] => {
    //console.log("sort option ", option);
  switch (option) {
    case SortOption.Unread:
      //return [...convs].sort((a, b) => b.unreadMessages - a.unreadMessages);
      return [...convs].filter(c => c.unreadMessages > 0);
    case SortOption.Unanswered:
      return [...convs].filter(c => !c.answered);
    case SortOption.Done:
      return [...convs].filter(c => c.answered);
    case SortOption.Newest:
      return [...convs].filter(c => c.messages == 0);
    default:
      return [...convs].sort((a, b) => {
        const timeA = new Date(a.lastMessage).getTime();
        const timeB = new Date(b.lastMessage).getTime();
        return timeB - timeA;
      });
    }
  };

  const updateConversation = (conversation: EventConversation) => {

    //console.log("update conversation");
    if (conversation.unreadMessages > 0) {

      const createdDate = new Date(conversation.lastMessage).getTime();
      const currentDate = new Date().getTime();

      if (currentDate - createdDate > 172800000) {
        conversation.style = { backgroundColor: 'red', borderWidth: '2px', borderColor: 'red' };
      } else {
        conversation.style = { backgroundColor: 'blue', borderWidth: '2px', borderColor: 'blue' };
      }
    } else {
      //console.log("everything read");
      if (conversation.messages) {
        //console.log("we have messages");
        conversation.style = { backgroundColor: 'white', borderWidth: '2px', borderColor: 'blue' };
      } else {
        //console.log("no style");
        conversation.style = {};
      }
    }
  }

  const loadConversationsListFromServer = async (
    setIsLoading: (loading: boolean) => void
  ) => {

    const companyId = partnerUser?.companyId;
    if (!companyId) {
      return;
    }

    const idToken = authUser?.idToken;
    if (!idToken) {
      return;
    }

    setIsLoading(true);

    const confs = await fetchEventConfigurationsByCompany(
      companyId,
      () => { },
      () => { },
    );

    if (!confs) {
      setIsLoading(false);
      return;
    }

    const sortedConfs = confs.sort((
      a: EventConfigurationModel,
      b: EventConfigurationModel
    ) => b.id - a.id);

    let eventConfigurations = [] as EventConfigurationModel[];
    const eventConversations = [] as EventConversation[];

    eventConfigurations = sortedConfs;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/partner/messages/getConversations/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`Fehler: ${res.status}`);

      const data = await res.json() as Conversation[];

      // loop booked events
      for (const event of eventConfigurations) 
      {

        // try to convert event to conversation
        const eventConversation: EventConversation = {
          ...event,
          unreadMessages: 0,
          formatedTime: "",
          extract: "",
          messages: 0,
          answered: false,
          lastMessage: "",
          style: {}
        };

        // now loop all conversations
        for (const conversation of data) 
        {

          if (eventConversation.date) {
            const date = new Date(eventConversation.date);
            const germanDate = new Intl.DateTimeFormat('de-DE', {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(date);
            eventConversation.formatedTime = germanDate;
          }

          if (conversation.id === event.id.toString()) {
            eventConversation.unreadMessages = conversation.unread;

            eventConversation.messages = conversation.entries;

            eventConversation.lastMessage = conversation.received;

            if (conversation.extract) {
              eventConversation.extract = conversation.extract.length > 20 ? conversation.extract.slice(0, 20) + "…" : conversation.extract; // extract
            }

            updateConversation(eventConversation);

            break;
          }
        }
        eventConversations.push(eventConversation);
      }

      InitReload(eventConversations);
    } catch (err) {
      console.error('Fehler beim Laden der Konversationsliste:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const loadConversation = async (
    conv: EventConversation, 
    markAsRead: boolean,
    setIsConvLoading: (loading: boolean) => void,
    setFocus: boolean = false
  ) => {
    const companyId = partnerUser?.companyId;
    if (!companyId) {
      return;
    }

    const idToken = authUser?.idToken;
    if (!idToken) {
      return;
    }

    setIsConvLoading(true);
    if(setFocus) setViewArea(1);

    try {
      const param = markAsRead ? 1 : 0;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/partner/messages/getConversationForId/${companyId}/${conv.id}/${param}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`Fehler: ${res.status}`);
      const data = await res.json() as ChatMessage[];
      if (markAsRead) conv.unreadMessages = 0;
      updateConversation(conv);
      setMessages(data);
      setCurrentConversation({ ...conv });
    } catch (err) {
      console.error('Fehler beim Laden der Konversation:', err);
    } finally{
      setIsConvLoading(false);
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
    if (event.target.files?.[0]) {
      setIsDisabled(true);
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
        setIsDisabled(false);
      }
    }
  };

  const getRequestTime = (created: string) => {
    const now = Date.now(); // aktuelle Zeit in Millisekunden
    const createdDate = new Date(created).getTime();
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

  const capitalize = (word: string) => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  const formatDates = (conf: EventConfigurationModel) => {
    const startDate = conf.date ? new Intl.DateTimeFormat('de-DE').format(new Date(conf.date)) : '?';
    const startTime = conf.date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.date)) : '?';
    const endTime = conf.endDate ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.endDate)) : '?';
    return `${startDate}, ${startTime} - ${endTime} Uhr`;
  }

  const InitReload = (data: EventConversation[]) => {
    const sorted = [...data];

    switch (sortOption) {
      case SortOption.Unread:
        sorted.sort((a, b) => b.unreadMessages - a.unreadMessages);
        break;
      case SortOption.Unanswered:
        sorted.sort((a, b) => Number(!a.answered) - Number(!b.answered));
        break;
      case SortOption.Done:
        sorted.sort((a, b) => Number(a.answered) - Number(b.answered));
        break;
      case SortOption.Newest:
      default:
        sorted.sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime());
        break;
  }

  setConversations(prev => {
    if (currentEventConfiguration) {
      const updatedConv = sorted.find(conv => conv.id === currentEventConfiguration?.id);
      if (updatedConv) {
        setCurrentConversation(updatedConv);
        loadConversation(updatedConv, false, setIsConvLoading, false);
      } else {
        setCurrentConversation(null);
      }
    }
    return sorted;
  });
};



  const handleSend = async () => {

    const companyId = partnerUser?.companyId;
    if (!companyId) {
      return;
    }

    const idToken = authUser?.idToken;
    if (!idToken) {
      console.log("no token");
      return;
    }

    if (!newMessage || !currentConversation) return;

    let lastReceived;
    for (const msg of messages) {
      if (msg.receiver === sender) {
        lastReceived = msg;
      }
    }

    if (!lastReceived) {
      lastReceived = {
        sender: currentConversation.booker?.email ?? '',
        subject: "Buchungsanfrage Location " + currentConversation.location?.title,
        messageId: ''
      }
    }

    setIsDisabled(true);
    setSending(true);

    const formDataObject = {
      partnerId: companyId.toString() || '',
      conversation: currentConversation.id.toString() || '',
      sender: sender,
      receiver: lastReceived.sender,
      subject: lastReceived.subject,
      inreplyto: lastReceived.messageId,
      content: newMessage,
      attachments: JSON.stringify(uploadedFileUrls)
    }

    // send message data to api
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/partner/messages/sendMessageForConversation/`,
      {
        method: 'POST',
        //body: formData,
        body: JSON.stringify(formDataObject),
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );


    if (res.ok) {
      const responseData = await res.json();
      setMessages((prev) => [...prev, responseData]);
      setNewMessage('');
      currentConversation.unreadMessages = 0;
      setSelectedFile([]);
      setUploadedFileUrls([]); // Clear after send
    } else {
      console.log("error: ",  + res)
      alert('Fehler beim Senden der Nachricht.');
    }
    setIsDisabled(false);
    setSending(false);
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
            width={isMobile ? "100%" : "20%"}
            display={isMobile && (viewArea != 0) ? "none" : "block"}
            minWidth={350}
            borderRight="1px solid #ccc"
            pr={2}
            sx={{ overflowY: 'auto', overflowX: 'hidden' }}
          >
            <Box
              sx={{
                mt: { xs: 5, md: 3 },
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                ml: 0,
                mb: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Posteingang
              </Typography>
              <SortDropdown
                value={sortOption}
                onChange={(e) => {
                  const option = e.target.value as SortOption;
                  setSortOption(option);
                  InitReload(conversations);
                }}
              />

            </Box>

            {isLoading ?
            (<WaitIcon />) :
            (<List>
              {sortConversations(conversations, sortOption).map(conv => (
                <ListItem
                  key={conv.id}
                  disablePadding
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: conv.id === currentConversation?.id ? '#e6f5fa' : '#eeeeee',
                  }}
                >
                  <ListItemButton
                    onClick={() => loadConversation(conv, true, setIsConvLoading, true)}
                    selected={conv.id === currentConversation?.id}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                  >
                    <Typography sx={{ fontSize: '14px', textAlign: 'left', margin: '0px' }} gutterBottom>
                      {`Anfrage ${conv.id}: ${conv.location?.title}`}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', textAlign: 'left', margin: '0px' }} gutterBottom>
                      {conv.extract ? `"${conv.extract}"` : ''}
                    </Typography>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        display: 'inline-block',
                        float: 'right',
                        marginTop: '4px',
                        borderStyle: 'solid',
                        borderWidth: '0px',
                        ...conv.style
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>)
            }
          </Box>

          {/* Rechte Spalte: Chat */}
          <Box width={isMobile ? "100%" : "50%"} pl={2} display={isMobile && (viewArea != 1) ? "none" : "flex"} flexDirection="column">
            {currentConversation && isMobile && (viewArea == 1) && (
              <Box width="100%" display="flex"
              sx={{
                  pb: 2
                }}>
                <Box width="50%" display="flex">
                  <Button variant="contained"
                    sx={{ borderRadius: 0, backgroundColor: '#002a58', '&:hover': { backgroundColor: '#002a58' } }}
                    onClick={() => { setViewArea(0); }}>Zur Liste</Button>
                </Box>
                <Box width="50%" display="flex" justifyContent="flex-end">
                  <Button variant="contained"
                    sx={{ borderRadius: 0, backgroundColor: '#002a58', '&:hover': { backgroundColor: '#002a58' } }}
                    onClick={() => { setViewArea(2); }}>Zeige Details</Button>
                </Box>
              </Box>
            )
            }
            <Typography sx={{ fontSize: '18px', textAlign: 'center' }} variant="h4" gutterBottom>
              {currentConversation ? `${currentConversation.booker?.givenName} ${currentConversation.booker?.familyName} | Anfrage für ${currentConversation.formatedTime} | ${currentConversation.location?.title} | ${currentConversation.location?.title}` : 'Keine Konversation ausgewählt'}
            </Typography>
            <Paper elevation={3} sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
            {isConvLoading && currentConversation ?
              (<WaitIcon />) :
              (<List>
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
              )
            }
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
                    disabled={isDisabled}
                  >
                    Antworten
                  </Button>
                  {
                    uploading || sending ? (<WaitIconSmall />) : ("")
                  }
                  <IconButton
                    component="label"
                    disabled={isDisabled}
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
          <Box 
            width={isMobile ? "100%" : "30%"}
            minWidth={350}
            display={isMobile && (viewArea != 2) ? "none" : "block"}
          >
            {isMobile && (viewArea == 2) && (
              <Box width="100%" display="flex"
                sx={{
                  ml: 2,
                  pr: 2
                }}>
                <Box width="50%" display="flex">
                  <Button 
                    variant="contained"
                    sx={{ borderRadius: 0, backgroundColor: '#002a58', '&:hover': { backgroundColor: '#002a58' } }}
                    onClick={() => { setViewArea(1); }}>Zur Konversation</Button>
                </Box>
              </Box>
            )
            }
            {currentConversation && (
              <Box sx={{
                mt: { xs: 2, md: 2 },
                pt: { xs: 2, md: 2 },
                ml: 2,
                pl: 2,
                pr: 2,
                width: '100%',
                bgcolor: '#f2f2f2'
              }}>
                <Typography gutterBottom>
                  {`Anfrage ${currentConversation.id}`}
                </Typography>
                <Typography gutterBottom>
                  {`Angefragt ${currentConversation.createdAt ? getRequestTime(currentConversation.createdAt) : ''}`}
                </Typography>
                <Typography sx={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', pt: 3, }} gutterBottom>
                  {`${currentConversation.booker?.givenName} ${currentConversation.booker?.familyName}`}
                </Typography>
                <Typography sx={{ fontSize: '18px', textAlign: 'center' }} gutterBottom>
                  {currentConversation.booker?.bookingCompany ? `${currentConversation.booker?.bookingCompany}` : ''}
                </Typography>
                <Box>
                  <Box sx={{
                    mt: { xs: 2, md: 2 },
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    ml: 2,
                    mb: 3
                  }}>
                    <Box width="50%">
                      <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
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
                      <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
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
                      mb: 3
                    }}>
                      <Box width="50%">
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
                          Anzahl Personen
                        </Typography>
                        <Typography gutterBottom>
                          {`${currentConversation.persons} Personen`}
                        </Typography>
                      </Box>
                      <Box width="50%">
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
                          Event Kategorie
                        </Typography>
                        <Typography gutterBottom>
                          {currentConversation.eventCategory != null && (
                            <Typography gutterBottom>
                              {capitalize(currentConversation.eventCategory)}
                            </Typography>
                          )}
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
                      mb: 3
                    }}>
                      <Box width="50%">
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
                          Räume
                        </Typography>
                        {currentConversation.rooms?.map((room, index) => (
                          <Typography key={index}>
                            {room.name}
                          </Typography>
                        ))}
                      </Box>
                      <Box width="50%">
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
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
                      mb: 3
                    }}>
                      <Box width="50%">
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
                          Angebotspreis
                        </Typography>
                        {formatRooms(currentConversation)}
                      </Box>
                      <Box width="50%" display="flex" gap={2} alignItems="center">
                        <Tooltip title="PDF ansehen">
                          <IconButton
                            component="a"
                            href="/pfad/zur/anzeige.pdf" // z.B. Viewer-URL oder direktes PDF
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <PictureAsPdfIcon color="primary" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="PDF herunterladen">
                          <IconButton
                            component="a"
                            href="/pfad/zum/download.pdf"
                            download
                          >
                            <DownloadIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{
                      mt: { xs: 1, md: 1 },
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 1,
                      ml: 2,
                      mb: 3
                    }}>
                      <Box  width="37%">
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
                          Telefon
                        </Typography>
                        <Typography gutterBottom>
                          {`${currentConversation.booker?.phoneNumber}`}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
                          E-Mail
                        </Typography>
                        <Typography gutterBottom noWrap>
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
                      mb: 3
                    }}>
                      <Box width="50%">
                        <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
                          Rechnungsanschrift
                        </Typography>
                        <Typography gutterBottom>
                          {currentConversation.booker?.bookingCompany?.streetAddress?.trim() 
                            ? currentConversation.booker.bookingCompany.streetAddress 
                            : "Nicht angegeben"}
                            {currentConversation.booker?.bookingCompany?.city?.trim() 
                            ? currentConversation.booker.bookingCompany.city 
                            : ""}
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