import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
    // Max tries is 20 times
    const maxRetries = 20;

    // Create state property for user input
    const [input, setInput] = useState('');
    // Create state property for image
    const [img, setImg] = useState('');

    // Numbers of retries
    const [retry, setRetry] = useState(0);
    // Number of retries left
    const [retryCount, setRetryCount] = useState(maxRetries);
    // Generation state tracker
    const [isGenerating, setIsGenerating] = useState(false);
    // Prompt tracker
    const [finalPrompt, setFinalPrompt] = useState('');



    // Save changes to input state
    const onChange = (event) => {
        setInput(event.target.value);
    };

    // generateAction for generate button
    const generateAction = async () => {
        console.log('Generating...');

        // Check to make sure there is no double click
        if (isGenerating && retry === 0) return;
        // Set loading has started
        setIsGenerating(true);

        // If this is a retry request, take away retryCount
        if (retry > 0) {
            setRetryCount((prevState) => {
                if (prevState === 0) {
                    return 0;
                } else {
                    return prevState - 1;
                }
            });

            setRetry(0);
        }

        // Fetch request
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'image/jpeg',
            },
            body: JSON.stringify({ input }),
        });

        const data = await response.json();

        // If model still loading, drop that retry time
        if (response.status === 503) {
            // Set the estimated_time property in state
            setRetry(data.estimated_time);
            return;
        }

        // If another error, drop error
        if (!response.ok) {
            console.log(`Error: ${data.error}`);
            setIsGenerating(false);
            return;
        }

        // Set final prompt
        setFinalPrompt(input);
        // Remove content from input box
        setInput('');
        // Set image data into state property
        setImg(data.image);
        // Everything is all done -- stop loading!
        setIsGenerating(false);
    }

    // Wait before retrying
    const sleep = (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    };

    // Trigger retry everytime retry property changes
    useEffect(() => {
        const runRetry = async () => {
            if (retryCount === 0) {
                console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
                setRetryCount(maxRetries);
                return;
            }

            console.log(`Trying again in ${retry} seconds.`);

            await sleep(retry * 1000);

            await generateAction();
        };

        if (retry === 0) {
            return;
        }

        runRetry();
    }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>The Rock AI Avatar Generator</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>The Rock (aka Dwayne Johnson) Generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Make avatars of The Rock! Make sure to refer to me as "elrock" in the prompt</h2>
          </div>
            <div className="prompt-container">
                <input className="prompt-box" value={input} onChange={onChange}/>
                <div className="prompt-buttons">
                    {/* Tweak classNames to change classes */}
                    <a
                        className={
                            isGenerating ? 'generate-button loading' : 'generate-button'
                        }
                        onClick={generateAction}
                    >
                        {/* Tweak to show a loading indicator */}
                        <div className="generate">
                            {isGenerating ? (
                                <span className="loader"></span>
                            ) : (
                                <p>Generate</p>
                            )}
                        </div>
                    </a>
                </div>
            </div>
        </div>
        {/* Add output container */}
          {img && (
              <div className="output-content">
                  <Image src={img} width={512} height={512} alt={finalPrompt} />
                  {/* Add prompt here */}
                  <p>{finalPrompt}</p>
              </div>
          )}
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
</div>
  );
};

export default Home;
