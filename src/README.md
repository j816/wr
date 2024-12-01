# AI Writing Coach

An interactive writing application that provides personalized feedback on your writing using AI technology. This tool helps writers improve their craft by offering structured prompts, custom evaluation criteria, and detailed AI-powered feedback powered by Claude AI or other language models.

![1](https://github.com/user-attachments/assets/4791ad45-ca03-4ed1-b947-01927e3d2d7b)


![2](https://github.com/user-attachments/assets/179693b8-86af-4bc9-9c75-2fb7cf77a07b)


## Features

- **Writing Prompts**: Access a database of customizable writing prompts organized by categories
- **Custom Evaluation Criteria**: Define specific criteria for AI evaluation of your writing
- **AI-Powered Feedback**: Get detailed, contextual feedback from advanced AI models
- **History Navigation**: Browse through previous prompts with forward/backward navigation
- **Multiple Categories**: Organize prompts and criteria into different writing categories
- **Data Management**: Built-in interface to manage prompts and evaluation criteria
- **Flexible API Settings**: Choose between different AI models (Claude, GPT-4, etc.)
- **Customizable Evaluation**: Create and modify evaluation criteria for different writing styles

## Prerequisites

- Python 3.8 or higher
- PyQt5
- An API key from Anthropic (for Claude) or OpenRouter
- SQLite (included with Python)

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/j816/writingapp.git
cd writingapp


2. Create a virtual environment and activate it:
python -m venv venv
source venv/bin/activate

3. Install required packages:

pip install PyQt5 anthropic python-dotenv

4. Set up your API keys:
   - Create a `.env` file in the root directory
   - Add your API keys:
ANTHROPIC_API_KEY=your_api_key_here
OPENROUTER_API_KEY=your_openrouter_key_here


5. Initialize the database:
python setup_db.py

## Quick Start Guide

1. Launch the application
2. Select a writing category from the dropdown menu
3. Choose an evaluation criteria
4. Click "Random" to get a writing prompt
5. Write your response in the text area
6. Click "Submit" to receive AI feedback

6. Run the application:

## Usage Examples

### 1. Creative Writing Practice

Perfect for fiction writers looking to enhance their descriptive writing skills.

**Example Workflow:**
1. Select "Descriptive Writing"
2. Get a prompt: "Describe a bustling marketplace without using the sense of sight"
3. Write your scene focusing on sounds, smells, and textures
4. Receive AI feedback on sensory details and imagery

### 2. Academic Writing Development

Ideal for students working on essays and academic papers.

**Features:**
- Structured argument development
- Thesis statement evaluation
- Citation and evidence analysis
- Academic tone assessment

### 3. Professional Communication

Helps business professionals improve their written communication.

**Key Benefits:**
- Email writing practice
- Business proposal feedback
- Report writing evaluation
- Professional tone guidance

### 4. Poetry Workshop

For poets working on various poetic forms and techniques.

**Includes:**
- Form-specific prompts (haiku, sonnet, free verse)
- Meter and rhythm analysis
- Imagery evaluation
- Emotional impact assessment

## Customization Guide

### Adding New Categories

1. Navigate to "Manage Data" tab
2. Click "Add Category"
3. Enter category name
4. Add prompts and criteria

### Creating Evaluation Criteria

Structure your criteria with these elements:
Technical Elements:
Grammar and syntax
Structure and organization
Style consistency
Content Elements:
Theme development
Argument strength
Evidence usage

## Customization

### Adding Custom Categories

1. Go to the "Manage Data" tab
2. Click "Add Category"
3. Enter your category name
4. Add prompts and evaluation criteria

### Creating Evaluation Criteria

You can create specific evaluation criteria for each category. For example:

- Technical aspects (grammar, structure)
- Content-specific elements
- Style and tone
- Genre-specific requirements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with PyQt5
- Powered by Anthropic's Claude and OpenRouter API
- Special thanks to all contributors

---

*Note: This application requires valid API keys to function. Make sure to obtain the necessary API keys before running the application.*
