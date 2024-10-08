import { FileUpload } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { TransitionProps } from '@mui/material/transitions';
import {
  FC,
  Suspense,
  forwardRef,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  customArgsState,
  downloadTemplateState,
  filenameTemplateState,
  savedTemplatesState,
} from '../atoms/downloadTemplate';
import { settingsState } from '../atoms/settings';
import { availableDownloadPathsState, connectedState } from '../atoms/status';
import FormatsGrid from '../components/FormatsGrid';
import { useI18n } from '../hooks/useI18n';
import { useRPC } from '../hooks/useRPC';
import type { DLMetadata } from '../types';
import { toFormatArgs } from '../utils';
import ExtraDownloadOptions from './ExtraDownloadOptions';
import { useNavigate } from 'react-router-dom';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DownloadPersist: FC = () => {
  const settings = useRecoilValue(settingsState);
  const isConnected = useRecoilValue(connectedState);
  const availableDownloadPaths = useRecoilValue(availableDownloadPathsState);
  const downloadTemplate = useRecoilValue(downloadTemplateState);
  const savedTemplates = useRecoilValue(savedTemplatesState);
  const navigate = useNavigate();

  const [downloadFormats, setDownloadFormats] = useState<DLMetadata>();
  const [pickedVideoFormat, setPickedVideoFormat] = useState('');
  const [pickedAudioFormat, setPickedAudioFormat] = useState('');
  const [pickedBestFormat, setPickedBestFormat] = useState('');

  const [customArgs, setCustomArgs] = useRecoilState(customArgsState);

  const [downloadPath, setDownloadPath] = useState('');

  const [filenameTemplate, setFilenameTemplate] = useRecoilState(
    filenameTemplateState
  );

  const [url, setUrl] = useState('');

  const [isPlaylist, setIsPlaylist] = useState(false);

  const { i18n } = useI18n();
  const { client } = useRPC();

  const urlInputRef = useRef<HTMLInputElement>(null);
  const customFilenameInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  /**
   * Retrive url from input, cli-arguments from checkboxes and emits via WebSocket
   */
  const sendUrl = async (immediate?: string) => {
    for (const line of url.split('\n')) {
      const codes = new Array<string>();
      if (pickedVideoFormat !== '') codes.push(pickedVideoFormat);
      if (pickedAudioFormat !== '') codes.push(pickedAudioFormat);
      if (pickedBestFormat !== '') codes.push(pickedBestFormat);

      await new Promise((r) => setTimeout(r, 10));
      client.download({
        url: immediate || line,
        args: `${toFormatArgs(codes)} ${downloadTemplate}`,
        pathOverride: downloadPath ?? '',
        renameTo: settings.fileRenaming ? filenameTemplate : '',
        playlist: isPlaylist,
      });

      setTimeout(() => {
        resetInput();
        setDownloadFormats(undefined);
      }, 100);
    }

    setUrl('');
  };

  /**
   * Retrive url from input and display the formats selection view
   */
  const sendUrlFormatSelection = () => {
    setPickedAudioFormat('');
    setPickedVideoFormat('');
    setPickedBestFormat('');

    client.formats(url)?.then((formats) => {
      setDownloadFormats(formats.result);
      resetInput();
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleFilenameTemplateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilenameTemplate(e.target.value);
  };

  const handleCustomArgsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomArgs(e.target.value);
  };

  const parseUrlListFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length < 1) {
      return;
    }

    const file = await files[0].text();

    file.split('\n').forEach((u) => sendUrl(u));
  };

  const resetInput = () => {
    urlInputRef.current!.value = '';
    if (customFilenameInputRef.current) {
      customFilenameInputRef.current!.value = '';
    }
  };

  return (
    <>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Download multiple times
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: (theme) =>
            `calc(99vh - ${theme.mixins.toolbar.minHeight}px)`,
        }}
      >
        <Container sx={{ my: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Grid container>
                  <TextField
                    multiline
                    fullWidth
                    ref={urlInputRef}
                    label={i18n.t('urlInput')}
                    variant="outlined"
                    onChange={handleUrlChange}
                    disabled={
                      !isConnected ||
                      (settings.formatSelection && downloadFormats != null)
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <label htmlFor="icon-button-file">
                            <input
                              hidden
                              id="icon-button-file"
                              type="file"
                              accept=".txt"
                              onChange={(e) => parseUrlListFile(e)}
                            />
                            <IconButton
                              color="primary"
                              aria-label="upload file"
                              component="span"
                            >
                              <FileUpload />
                            </IconButton>
                          </label>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {settings.enableCustomArgs && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={i18n.t('customArgsInput')}
                        variant="outlined"
                        onChange={handleCustomArgsChange}
                        value={customArgs}
                        disabled={
                          !isConnected ||
                          (settings.formatSelection && downloadFormats != null)
                        }
                      />
                    </Grid>
                  )}
                  {settings.fileRenaming && (
                    <Grid item xs={settings.pathOverriding ? 8 : 12}>
                      <TextField
                        sx={{ mt: 1 }}
                        ref={customFilenameInputRef}
                        fullWidth
                        label={i18n.t('customFilename')}
                        variant="outlined"
                        value={filenameTemplate}
                        onChange={handleFilenameTemplateChange}
                        disabled={
                          !isConnected ||
                          (settings.formatSelection && downloadFormats != null)
                        }
                      />
                    </Grid>
                  )}
                  {settings.pathOverriding && (
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <Autocomplete
                          disablePortal
                          options={availableDownloadPaths.map((dir) => ({
                            label: dir,
                            dir,
                          }))}
                          autoHighlight
                          getOptionLabel={(option) => option.label}
                          onChange={(_, value) => {
                            setDownloadPath(value?.dir!);
                          }}
                          renderOption={(props, option) => (
                            <Box
                              component="li"
                              sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                              {...props}
                            >
                              {option.label}
                            </Box>
                          )}
                          sx={{ width: '100%', mt: 1 }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={i18n.t('customPath')}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
                <Suspense>
                  {savedTemplates.length > 0 && <ExtraDownloadOptions />}
                </Suspense>
                <Grid
                  container
                  spacing={1}
                  pt={2}
                  justifyContent="space-between"
                >
                  <Grid item>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={() => setIsPlaylist((state) => !state)}
                          />
                        }
                        checked={isPlaylist}
                        label={i18n.t('playlistCheckbox')}
                      />
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      disabled={url === ''}
                      onClick={() =>
                        settings.formatSelection
                          ? startTransition(() => sendUrlFormatSelection())
                          : sendUrl()
                      }
                    >
                      {settings.formatSelection
                        ? i18n.t('selectFormatButton')
                        : i18n.t('startButton')}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          {/* Format Selection grid */}
          {downloadFormats && (
            <FormatsGrid
              downloadFormats={downloadFormats}
              onBestQualitySelected={(id) => {
                setPickedBestFormat(id);
                setPickedVideoFormat('');
                setPickedAudioFormat('');
              }}
              onVideoSelected={(id) => {
                setPickedVideoFormat(id);
                setPickedBestFormat('');
              }}
              onAudioSelected={(id) => {
                setPickedAudioFormat(id);
                setPickedBestFormat('');
              }}
              onClear={() => {
                setPickedAudioFormat('');
                setPickedVideoFormat('');
                setPickedBestFormat('');
              }}
              onSubmit={sendUrl}
              pickedBestFormat={pickedBestFormat}
              pickedVideoFormat={pickedVideoFormat}
              pickedAudioFormat={pickedAudioFormat}
            />
          )}
        </Container>
      </Box>
    </>
  );
};

export default DownloadPersist;
