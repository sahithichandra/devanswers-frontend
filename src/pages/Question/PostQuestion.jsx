import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaPaperPlane, FaMagic } from "react-icons/fa";

import { postQuestion } from "../../reducers/questionSlice.js";
import { improveQuestion } from "../../services/aiService.js";

import {
  Col,
  Container,
  Form,
  Button,
  Card,
  Row,
  Alert,
  Spinner,
} from "react-bootstrap";
import "./PostQuestion.css";

const PostQuestion = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [isImproving, setIsImproving] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user.userInfo);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(postQuestion({ title, description, tags }));
      if (postQuestion.fulfilled.match(result)) {
        const newQuestion = result.payload;
        alert("Question posted successfully!");
        navigate(`/question/${newQuestion._id}`);
      }
    } catch (error) {
      console.error("Error posting question:", error);
      alert("Failed to post question. Please try again.");
    }
  };

  const handleImprove = async () => {
    if (!userInfo?.token) {
      alert("Session expired. Please log out and log back in.");
      return;
    }
    setIsImproving(true);
    try {
      const improved = await improveQuestion(
        { title, description, tags },
        userInfo.token,
      );
      setSuggestions(improved);
    } catch (error) {
      const status = error?.response?.status;
      const detail =
        error?.response?.data?.message || error?.message || "Unknown error";
      if (status === 401) {
        alert(
          "Session expired. Please log out and log back in, then try again.",
        );
      } else {
        alert(`Failed to improve question: ${detail}`);
      }
    } finally {
      setIsImproving(false);
    }
  };

  const acceptSuggestion = (field) => {
    if (field === "title") setTitle(suggestions.title);
    if (field === "description") setDescription(suggestions.description);
    if (field === "tags") setTags(suggestions.tags);
    setSuggestions((prev) => ({ ...prev, [field]: null }));
  };

  const rejectSuggestion = (field) => {
    setSuggestions((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <Container className="py-3 px-2 py-sm-4 px-sm-3 pq-page-container">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={9}>
          <Card className="mb-4 pq-header-card">
            <Card.Body className="p-3 p-sm-4">
              <Card.Title as="h2" className="pq-title">
                Ask a Question
              </Card.Title>
              <p className="text-muted mb-0">
                Be specific and imagine you're asking another person
              </p>
            </Card.Body>
          </Card>

          <Card className="pq-body-card">
            <Card.Body className="p-3 p-sm-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label htmlFor="title" className="pq-label">
                    Title
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your programming question?"
                    required
                    className="pq-input"
                  />
                  {suggestions?.title && (
                    <Alert variant="info" className="mt-2 mb-0 p-2">
                      <div className="mb-2">
                        <strong>Suggested:</strong> {suggestions.title}
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => acceptSuggestion("title")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => rejectSuggestion("title")}
                      >
                        Reject
                      </Button>
                    </Alert>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="description" className="pq-label">
                    Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more details about your question..."
                    rows={10}
                    required
                    className="pq-textarea"
                  />
                  {suggestions?.description && (
                    <Alert variant="info" className="mt-2 mb-0 p-2">
                      <div className="mb-2">
                        <strong>Suggested:</strong> {suggestions.description}
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => acceptSuggestion("description")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => rejectSuggestion("description")}
                      >
                        Reject
                      </Button>
                    </Alert>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="tags" className="pq-label">
                    Tags (comma-separated)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="tags"
                    name="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., javascript, react, css"
                    className="pq-input"
                  />
                  <Form.Text className="text-muted">
                    Add up to 5 tags to describe what your question is about
                  </Form.Text>
                  {suggestions?.tags && (
                    <Alert variant="info" className="mt-2 mb-0 p-2">
                      <div className="mb-2">
                        <strong>Suggested:</strong> {suggestions.tags}
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => acceptSuggestion("tags")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => rejectSuggestion("tags")}
                      >
                        Reject
                      </Button>
                    </Alert>
                  )}
                </Form.Group>

                {userInfo && (
                  <Button
                    type="button"
                    variant="outline-primary"
                    size="lg"
                    className="w-100 mb-3"
                    onClick={handleImprove}
                    disabled={isImproving || (!title && !description)}
                  >
                    {isImproving ? (
                      <>
                        <Spinner as="span" size="sm" className="me-2" />
                        Improving...
                      </>
                    ) : (
                      <>
                        <FaMagic className="me-2" />
                        Improve with AI
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 pq-btn"
                >
                  <FaPaperPlane className="me-2" />
                  Post Question
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PostQuestion;
